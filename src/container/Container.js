export default class Container {
    constructor(id, name, rb) {
        this.rb = rb;
        this.id = id;
        this.panelItem = null;
        this.name = name;
    }

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

    isElementAllowed(elementType) {
        return false;
    }

    dragOver(elementType) {
    }

    getOffset() {
        return { x: 0, y: 0 };
    }

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

    isInside(posX, posY) {
        return false;
    }

    clearErrors() {
    }
}
