import TextElement from './TextElement';
import DocElement from './DocElement';

/**
 * Watermark text element, the text is displayed on the page background.
 * @class
 */
export default class WatermarkTextElement extends TextElement {
    constructor(id, initialData, rb) {
        super(id, initialData, rb);
        this.rotateDeg = 0;
        this.opacity = 30;
        this.showInForeground = false;
        // watermark properties must be set explicitly because they did not exist in TextElement constructor
        for (const key of ['rotateDeg', 'opacity', 'showInForeground']) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
    }

    setValue(field, value) {
        super.setValue(field, value);

        if (field === 'rotateDeg' || field === 'opacity') {
            this.updateDisplay();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'x', 'y', 'width', 'height', 'content', 'eval', 'rotateDeg', 'opacity', 'showInForeground',
            'styleId', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor', 'font', 'fontSize',
            'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'printIf',
        ];
    }

    getElementType() {
        return DocElement.type.watermarkText;
    }

    updateDisplayInternal(x, y, width, height) {
        super.updateDisplayInternal(x, y, width, height);
        this.el.style.rotate = this.rotateDeg + 'deg';
        this.elContent.style.opacity = this.opacity / 100.0;
    }

    /**
     * Watermark is only shown when element is selected.
     */
    select() {
        super.select();
        this.el.classList.remove('rbroHidden');
        this.el.style.zIndex = '';
    }

    deselect() {
        super.deselect();
        this.el.classList.add('rbroHidden');
    }

    createElement() {
        super.createElement();
        this.el.classList.add('rbroHidden');
    }

    /**
     * Returns true if element is restricted within container boundaries.
     *
     * Watermark elements are not restricted to any containers.
     * @returns {boolean}
     */
    hasBoundaries() {
        return false;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'WatermarkTextElement';
    }
}
