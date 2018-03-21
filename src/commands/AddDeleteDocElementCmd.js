import Command from './Command';
import BandElement from '../elements/BandElement';
import BarCodeElement from '../elements/BarCodeElement';
import DocElement from '../elements/DocElement';
import FrameElement from '../elements/FrameElement';
import ImageElement from '../elements/ImageElement';
import LineElement from '../elements/LineElement';
import PageBreakElement from '../elements/PageBreakElement';
import TableElement from '../elements/TableElement';
import TextElement from '../elements/TextElement';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Command to add and delete a doc element.
 * @class
 */
export default class AddDeleteDocElementCmd {
    constructor(add, elementType, initialData, id, parentId, position, rb) {
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
            let element;
            let properties = { draggable: true };
            if (this.elementType === DocElement.type.text) {
                element = new TextElement(this.id, this.initialData, this.rb);
            } else if (this.elementType === DocElement.type.line) {
                element = new LineElement(this.id, this.initialData, this.rb);
            } else if (this.elementType === DocElement.type.image) {
                element = new ImageElement(this.id, this.initialData, this.rb);
            } else if (this.elementType === DocElement.type.pageBreak) {
                element = new PageBreakElement(this.id, this.initialData, this.rb);
            } else if (this.elementType === DocElement.type.table) {
                element = new TableElement(this.id, this.initialData, this.rb);
                properties.hasChildren = true;
            } else if (this.elementType === DocElement.type.frame) {
                element = new FrameElement(this.id, this.initialData, this.rb);
                properties.hasChildren = true;
            } else if (this.elementType === DocElement.type.band) {
                element = new BandElement(this.id, this.initialData, this.rb);
                properties.hasChildren = true;
                properties.showAdd = true;
                // properties.draggable = false;
            } else if (this.elementType === DocElement.type.barCode) {
                element = new BarCodeElement(this.id, this.initialData, this.rb);
            }
            this.rb.addDocElement(element);
            let panelItem = new MainPanelItem(this.elementType, '', parent.getPanelItem(), element, properties, this.rb);
            panelItem.openParentItems();
            element.setPanelItem(panelItem);
            parent.getPanelItem().insertChild(this.position, panelItem);
            element.setup();
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
            this.rb.notifyEvent(element, Command.operation.remove);
            this.rb.deleteDocElement(element);
        }
    }
}
