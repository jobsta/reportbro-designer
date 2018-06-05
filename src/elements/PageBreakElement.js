import DocElement from './DocElement';

/**
 * Page break doc element. A page break triggers a new page when the document is printed.
 * @class
 */
export default class PageBreakElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementPageBreak'), id, -1, 1, rb);
        this.setInitialData(initialData);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        this.updateDisplay();
        this.updateStyle();
    }

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'y'];
    }

    getElementType() {
        return DocElement.type.pageBreak;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(0), top: this.rb.toPixel(y),
                width: '100%', height: this.rb.toPixel(1) };
            this.el.css(props);
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getYTagId() {
        return 'rbro_page_break_element_position_y';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroPageBreakElement"></div>`);
        this.appendToContainer();
        super.registerEventHandlers();
    }
}
