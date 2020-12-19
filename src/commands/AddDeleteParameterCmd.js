import Command from './Command';
import Parameter from '../data/Parameter';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Command to add and delete a parameter.
 * @class
 */
export default class AddDeleteParameterCmd extends Command {
    constructor(add, initialData, id, parentId, position, rb) {
        super();
        this.add = add;
        this.initialData = initialData;
        this.parentId = parentId;
        this.position = position;
        this.rb = rb;
        this.id = id;
        this.showDelete = true;
    }

    getName() {
        if (this.add) {
            return 'Add parameter';
        } else {
            return 'Delete parameter';
        }
    }

    setShowDelete(showDelete) {
        this.showDelete = showDelete;
    }

    do() {
        if (this.add) {
            this.addParameter();
        } else {
            this.deleteParameter();
        }
    }

    undo() {
        if (this.add) {
            this.deleteParameter();
        } else {
            this.addParameter();
        }
    }

    addParameter() {
        let parent = this.rb.getDataObject(this.parentId);
        if (parent !== null) {
            let parameter = new Parameter(this.id, this.initialData, this.rb);
            this.rb.addParameter(parameter);
            let panelItem = new MainPanelItem(
                'parameter', parent.getPanelItem(), parameter,
                { hasChildren: true, showAdd: true, showDelete: this.showDelete, draggable: true }, this.rb);
            panelItem.openParentItems();
            parameter.setPanelItem(panelItem);
            parent.getPanelItem().insertChild(this.position, panelItem);
            parameter.setup();
            this.rb.notifyEvent(parameter, Command.operation.add);
        }
    }

    deleteParameter() {
        let parameter = this.rb.getDataObject(this.id);
        if (parameter !== null) {
            this.initialData = parameter.toJS();
            this.rb.deleteParameter(parameter);
        }
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'AddDeleteParameterCmd';
    }
}