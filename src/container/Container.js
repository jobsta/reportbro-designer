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
        this.el = null;
        this.elContent = null;
        this.owner = null;
        this.level = 0;  // number of containers "above"
        this.parent = null;  // parent container
    }

    init(owner) {
        this.owner = owner;
        this.el = owner.getElement();
        this.elContent = owner.getContentElement();
        this.panelItem = owner.getPanelItem();
        this.parent = owner.getContainer();
        this.level = 0;
        let parent = this.parent;
        while (parent !== null) {
            this.level++;
            parent = parent.getParent();
        }
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
    }

    remove() {
    }

    appendElement(el) {
        if (this.elContent !== null) {
            this.elContent.append(el);
        }
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

    getLevel() {
        return this.level;
    }

    getParent() {
        return this.parent;
    }

    setParent(parent) {
        this.parent = parent;
        this.level = 0;
        while (parent !== null) {
            this.level++;
            parent = parent.getParent();
        }
    }

    isSelected() {
        if (this.owner !== null && this.rb.isSelectedObject(this.owner.getId())) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        return false;
    }

    /**
     * Update container style when an element is currently dragged over this container.
     */
    dragOver() {
        if (this.el !== null) {
            this.el.addClass('rbroElementDragOver');
        }
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        return { x: 0, y: 0 };
    }

    /**
     * Returns offset relative to other container.
     * @param {Container} otherContainer
     * @returns {Object} x and y offset coordinates.
     */
    getOffsetTo(otherContainer) {
        if (otherContainer !== null && otherContainer != this) {
            let offset = this.getOffset();
            let otherOffset = otherContainer.getOffset();
            return { x: offset.x - otherOffset.x, y: offset.y - otherOffset.y };
        }
        return { x: 0, y: 0 };
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getSize() {
        return { width: 0, height: 0 };
    }

    /**
     * Returns container content size.
     * @returns {Object} width and height of container content area.
     */
    getContentSize() {
        return { width: 0, height: 0 };
    }

    /**
     * Returns true if given absolute position is inside container.
     * @param {Number} posX - absolute x coordinate.
     * @param {Number} posY - absolute y coordinate.
     */
    isInside(posX, posY) {
        let offset = this.getOffset();
        let size = this.getSize();
        posX -= offset.x;
        posY -= offset.y;
        if (posX >= 0 && posY >= 0 && posX < size.width && posY < size.height) {
            return true;
        }
        return false;
    }

    clearErrors() {
    }
}
