import DocElement from './DocElement';
import * as utils from '../utils'

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

    setValue(field, value) {
        super.setValue(field, value);
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return ['y', 'printIf'];
    }

    getElementType() {
        return DocElement.type.pageBreak;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(0);
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = '100%';
            this.el.style.height = this.rb.toPixel(1);
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroPageBreakElement' });
        this.appendToContainer();
        super.registerEventHandlers();
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'PageBreakElement';
    }
}
