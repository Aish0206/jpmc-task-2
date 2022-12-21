import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */

//    extending PerspectiveViewerElement interface to HTMLElement
//  to enable PerspectiveViewerElement behave as HTMLElement

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    // change assignment of const elem directly to 'document.getElementsByTagName'
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // adding more attribute to the element of Graph
      elem.setAttribute('view','y_line'); // to get continuous line graph we have to use y_line view instead of grid
      elem.setAttribute('column-pivots','["stock"]'); // to find difference between stock ABC and stock DEF with getting values from ["stock"]
      elem.setAttribute('row-pivots','["timestamp"]');  // with help of this we can map each datapoint based on timestamp
      elem.setAttribute('column','["top_ask_price"]'); // this help us to get same data points of stock for now we are focusing on top_ask_price
      elem.setAttribute('aggregates',`
          {"stock":"distinct count",
            "top_ask_price":"avg",
            "top_bid_price":"avg",
            "timestamp":"distinct count"}`);// aggregates will handle duplicated data; we are using this because we want only unique stock

      // Add more Perspective configurations here.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
