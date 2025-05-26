import DocElement from "../elements/DocElement";

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
        this.initLevel();
    }

    /**
     * Set nested level of container.
     * Should be alled after initialization and whenever the container is moved to a new parent.
     */
    initLevel() {
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

    /**
     * Append document elements of this container.
     * @param {Boolean} asObjects - if true the document element instances are returned, otherwise
     * each instance is transformed to a js map.
     * @param {DocElement[]} docElements - list where document elements will be appended to.
     */
    appendDocElements(asObjects, docElements) {
        for (const child of this.getPanelItem().getChildren()) {
            if (child.getData() instanceof DocElement) {
                const docElement = child.getData();
                if (asObjects) {
                    docElements.push(docElement);
                    // we are also adding all internal children (document elements which belong
                    // to other document elements and cannot be created independently),
                    // e.g. a table band or a table cell (table text) of a table element.
                    docElement.addChildren(docElements);
                } else {
                    // js map also includes data of internal children
                    docElements.push(docElement.toJS());
                }
                // add children of doc elements which represent containers, e.g. frames or section bands
                for (const container of docElement.getLinkedContainers()) {
                    container.appendDocElements(asObjects, docElements);
                }
            }
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

    /**
     * Must be called when the container is moved to a new parent
     * (i.e. element of container is moved into another container).
     * @param {DocElement} parent
     */
    setParent(parent) {
        this.parent = parent;
        // because the parent was changed the container can now have a different container level
        this.initLevel();
    }

    /**
     * Return true if this container is a child of the given container.
     * @param {Container} container
     * @return {Boolean}
     */
    isChildOf(container) {
        let parent = this.getParent();
        while (parent !== null) {
            if (parent === container) {
                return true;
            }
            parent = parent.getParent();
        }
        return false;
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
            this.el.classList.add('rbroElementDragOver');
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
        if (otherContainer !== null && otherContainer !== this) {
            const offset = this.getOffset();
            const otherOffset = otherContainer.getOffset();
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
        const offset = this.getOffset();
        const size = this.getSize();
        posX -= offset.x;
        posY -= offset.y;
        return (posX >= 0 && posY >= 0 && posX < size.width && posY < size.height);
    }

    clearErrors() {
    }
}
