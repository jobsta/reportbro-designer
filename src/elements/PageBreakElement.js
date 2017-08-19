import DocElement from './DocElement';

export default class PageBreakElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementPageBreak'), id, -1, 1, rb);
        this.setInitialData(initialData);
    }

    setup() {
        super.setup();
        this.createElement();
        this.updateDisplay();
        this.updateStyle();
    }

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);
    }

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

    getSizers() {
        return [];
    }

    getXTagId() {
        return '';
    }

    getYTagId() {
        return 'rbro_page_break_element_position_y';
    }

    getWidthTagId() {
        return '';
    }

    getHeightTagId() {
        return '';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroPageBreakElement"></div>`);
        this.appendToContainer();
        super.registerEventHandlers();
    }
}
