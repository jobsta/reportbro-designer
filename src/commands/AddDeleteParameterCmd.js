import Command from './Command';
import Parameter from '../data/Parameter';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Command to add and delete a parameter.
 * @class
 */
export default class AddDeleteParameterCmd {
    constructor(add, initialData, id, parentId, position, rb) {
        this.add = add;
        this.initialData = initialData;
        this.parentId = parentId;
        this.position = position;
        this.rb = rb;
        this.id = id;
    }

    getName() {
        if (this.add) {
            return 'Add parameter';
        } else {
            return 'Delete parameter';
        }
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
                'parameter', parent.getPanelItem(), parameter, { hasChildren: true, showAdd: true, draggable: true }, this.rb);
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
            this.rb.notifyEvent(parameter, Command.operation.remove);
            this.rb.deleteParameter(parameter);
            parameter.getPanelItem().getParent().removeChild(parameter.getPanelItem());
        }
    }
}