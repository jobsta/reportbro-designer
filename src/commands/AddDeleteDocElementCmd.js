import Command from './Command';
import BarCodeElement from '../elements/BarCodeElement';
import DocElement from '../elements/DocElement';
import FrameElement from '../elements/FrameElement';
import ImageElement from '../elements/ImageElement';
import LineElement from '../elements/LineElement';
import PageBreakElement from '../elements/PageBreakElement';
import SectionElement from '../elements/SectionElement';
import TableElement from '../elements/TableElement';
import TextElement from '../elements/TextElement';
import WatermarkImageElement from '../elements/WatermarkImageElement';
import WatermarkTextElement from '../elements/WatermarkTextElement';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Command to add and delete a doc element.
 * @class
 */
export default class AddDeleteDocElementCmd extends Command {
    constructor(add, elementType, initialData, id, parentId, position, rb) {
        super();
        this.add = add;
        this.elementType = elementType;
        this.initialData = initialData;
        this.parentId = parentId;
        this.position = position;
        this.rb = rb;
        this.id = id;
        this.firstExecution = true;
    }

    getName() {
        if (this.add) {
            return 'Add element';
        } else {
            return 'Delete element';
        }
    }

    do() {
        if (this.add) {
            this.addElement();
        } else {
            this.deleteElement();
        }
        this.firstExecution = false;
    }

    undo() {
        if (this.add) {
            this.deleteElement();
        } else {
            this.addElement();
        }
    }

    addElement() {
        let parent = this.rb.getDataObject(this.parentId);
        if (parent !== null) {
            let element = AddDeleteDocElementCmd.createElement(
                this.id, this.initialData, this.elementType, this.position, true, this.rb);

            this.rb.notifyEvent(element, Command.operation.add);
            this.rb.selectObject(this.id, true);

            if (this.add && this.firstExecution) {
                // in case of add command we serialize initialData on first execution so it contains all data
                // created during setup (e.g. ids of table bands and table cells for a table)
                this.initialData = element.toJS();
            }
        }
    }

    deleteElement() {
        let element = this.rb.getDataObject(this.id);
        if (element !== null) {
            this.rb.deleteDocElement(element);
        }
    }

    static createElement(id, data, elementType, panelPos, openPanelItem, rb) {
        let element;
        let properties = { draggable: true };
        if (elementType === DocElement.type.text) {
            element = new TextElement(id, data, rb);
        } else if (elementType === DocElement.type.line) {
            element = new LineElement(id, data, rb);
        } else if (elementType === DocElement.type.image) {
            element = new ImageElement(id, data, rb);
        } else if (elementType === DocElement.type.pageBreak) {
            element = new PageBreakElement(id, data, rb);
        } else if (elementType === DocElement.type.table) {
            element = new TableElement(id, data, rb);
            properties.hasChildren = true;
        } else if (elementType === DocElement.type.frame) {
            element = new FrameElement(id, data, rb);
            properties.hasChildren = true;
        } else if (elementType === DocElement.type.section) {
            element = new SectionElement(id, data, rb);
            properties.hasChildren = true;
        } else if (elementType === DocElement.type.barCode) {
            element = new BarCodeElement(id, data, rb);
        } else if (elementType === DocElement.type.watermarkText) {
            element = new WatermarkTextElement(id, data, rb);
        } else if (elementType === DocElement.type.watermarkImage) {
            element = new WatermarkImageElement(id, data, rb);
        }
        rb.addDocElement(element);
        let parentPanel = element.getContainer().getPanelItem();
        let panelItem = new MainPanelItem(elementType, parentPanel, element, properties, rb);
        element.setPanelItem(panelItem);
        parentPanel.insertChild(panelPos, panelItem);
        element.setup(openPanelItem);
        return element;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'AddDeleteDocElementCmd';
    }
}
