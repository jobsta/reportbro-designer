/**
 * Container can contain doc elements. The doc elements are always relative to the container offset.
 * @class
 */
export default class Container {
    constructor(id, name, rb) {
        this.rb = rb;
        this.id = id;
        this.panelItem = null;
        this.name = name;
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    appendElement(el) {
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        return false;
    }

    /**
     * Update container style when given element type is currently dragged over this container.
     * @param {String} elementType
     */
    dragOver(elementType) {
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        return { x: 0, y: 0 };
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getOffsetTo(otherContainer) {
        if (otherContainer !== null && otherContainer != this) {
            let offset = this.getOffset();
            let otherOffset = otherContainer.getOffset();
            return { x: offset.x - otherOffset.x, y: offset.y - otherOffset.y };
        }
        return { x: 0, y: 0 };
    }

    getSize() {
        return { width: 0, height: 0 };
    }

    /**
     * Returns true if given absolute position is inside container.
     * @param {Number} x - absolute x coordinate.
     * @param {Number} y - absolute y coordinate.
     */
    isInside(posX, posY) {
        return false;
    }

    clearErrors() {
    }
}
