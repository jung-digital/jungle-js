import GraphicRenderer from './core/GraphicRenderer.js';
import GraphicContainer from './core/GraphicContainer.js';
import Graphic from './core/Graphic.js';
import Document from './core/Document.js';

import GraphicRendererEvents from './core/events/GraphicRendererEvents.js';
import GraphicEvents from './core/events/GraphicEvents.js';
import MouseEvents from './core/events/MouseEvents.js';
import DocumentEvents from './core/events/DocumentEvents.js';

import Array from './core/util/Array';
import Color from './core/util/Color';
import Dispatcher from './core/util/Dispatcher';
import DispatcherNode from './core/util/DispatcherNode';
import Event from './core/util/Event';
import Number from './core/util/Number';
import Rect from './core/util/Rect';
import Vec2 from './core/util/Vec2';

export default {
  GraphicRenderer: GraphicRenderer,
  GraphicContainer: GraphicContainer,
  Graphic: Graphic,
  Document: Document,
  events: {
    GraphicEvents: GraphicEvents,
    GraphicRendererEvents: GraphicRendererEvents,
    MouseEvents: MouseEvents,
    DocumentEvents: DocumentEvents
  },
  util: {
    Array: Array,
    Color: Color,
    Dispatcher: Dispatcher,
    DispatcherNode: DispatcherNode,
    Event: Event,
    Number: Number,
    Rect: Rect,
    Vec2: Vec2
  }
};
