import DocElement from './DocElement';
import * as utils from '../utils'

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

    setValue(field, value) {
        super.setValue(field, value);
        if (field === 'color') {
            this.updateStyle();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return ['x', 'y', 'width', 'height', 'styleId', 'color', 'printIf'];
    }

    getElementType() {
        return DocElement.type.line;
    }

    updateStyle() {
        this.el.style.backgroundColor = this.getValue('color');
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['E', 'W'];
    }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroLineElement' });
        this.appendToContainer();
        super.registerEventHandlers();
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'LineElement';
    }
}
