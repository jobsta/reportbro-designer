import DocElement from './DocElement';

/**
 * Line doc element. Currently only horizontal lines are supported.
 * @class
 */
export default class LineElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementLine'), id, 100, 1, rb);
        this.color = '#000000';
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
        if (field === 'color') {
            this.updateStyle();
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'x', 'y', 'width', 'height', 'color', 'printIf'];
    }

    getElementType() {
        return DocElement.type.line;
    }

    updateStyle() {
        let styleProperties = {};
        styleProperties['background-color'] = this.getValue('color');
        this.el.css(styleProperties);
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['E', 'W'];
    }

    getXTagId() {
        return 'rbro_line_element_position_x';
    }

    getYTagId() {
        return 'rbro_line_element_position_y';
    }

    getWidthTagId() {
        return 'rbro_line_element_width';
    }

    getHeightTagId() {
        return 'rbro_line_element_height';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroLineElement"></div>`);
        this.appendToContainer();
        super.registerEventHandlers();
    }
}
