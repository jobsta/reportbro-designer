import Container from './Container';
import DocElement from '../elements/DocElement';
import Document from '../Document';
import * as utils from '../utils';

/**
 * A frame container which can contain various doc elements.
 * @class
 */
export default class Frame extends Container {
    constructor(id, name, rb) {
        super(id, name, rb);
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        this.el = this.rb.getDocument().getElement(this.band);
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        return elementType !== DocElement.type.pageBreak && elementType !== DocElement.type.frame &&
            elementType !== DocElement.type.section;
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        let x = 0, y = 0;
        if (this.owner !== null) {
            x = this.owner.getValue('xVal');
            y = this.owner.getValue('yVal');
        }
        if (this.parent !== null) {
            let offset = this.parent.getOffset();
            x += offset.x;
            y += offset.y;
        }
        return { x: x, y: y };
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getSize() {
        let width = 0, height = 0;
        if (this.owner !== null) {
            width = this.owner.getValue('widthVal');
            height = this.owner.getValue('heightVal');
        }
        return { width: width, height: height };
    }
    
    /**
     * Returns container content size.
     * This is the container minus optional borders, thus the available area for
     * elements inside the frame.
     * @returns {Object} width and height of container content area.
     */
    getContentSize() {
        let width = 0, height = 0;
        if (this.owner !== null) {
            width = this.owner.getValue('widthVal');
            height = this.owner.getValue('heightVal');
            let borderWidth = this.owner.getValue('borderWidthVal');
            if (this.owner.getValue('borderLeft')) {
                width -= borderWidth;
            }
            if (this.owner.getValue('borderRight')) {
                width -= borderWidth;
            }
            if (this.owner.getValue('borderTop')) {
                height -= borderWidth;
            }
            if (this.owner.getValue('borderBottom')) {
                height -= borderWidth;
            }
        }
        return { width: width, height: height };
    }
}
