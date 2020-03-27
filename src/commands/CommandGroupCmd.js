import Command from './Command';
import SetValueCmd from './SetValueCmd';

/**
 * Command container for multiple commands. All commands of this container will be executed in a single do/undo operation.
 * @class
 */
export default class CommandGroupCmd extends Command {
    constructor(name, rb) {
        super();
        this.name = name;
        this.rb = rb;
        this.commands = [];
        this.selectObjectIds = [];

        // if false then notifyEvent will not be called for change event in SetValue commands added.
        // this can be useful if multiple elements are selected and modified simultaneously.
        // the change event may only be fired for the last object because in between command execution
        // the objects contain different values (although they will be changed to the same value
        // with the last command) and this can lead to reseting the cursor caret in an input field
        // if the cursor is not at the end of the input text.
        this.notifyChange = true;
    }

    getName() {
        return this.name;
    }

    do() {
        for (let i=0; i < this.commands.length; i++) {
            this.commands[i].do();
        }
        this.selectObjects();
    }

    undo() {
        for (let i=this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
        this.selectObjects();
    }

    addCommand(cmd) {
        if (cmd instanceof SetValueCmd) {
            // disable select for specific command, selection is handled in command group
            // when the commands are executed
            cmd.disableSelect();

            if (!this.notifyChange) {
                cmd.setNotifyChange(false);
            }
        }
        this.commands.push(cmd);
    }

    /**
     * Add id of object which should be selected when this command group is executed.
     * @param {Number} objId - object id
     */
    addSelection(objId) {
        if (this.selectObjectIds.indexOf(objId) === -1) {
            this.selectObjectIds.push(objId);
        }
    }

    /**
     * Allows to enable/disable notification of change event for the following commands
     * added with addCommand.
     * @param {Boolean} notify - notify flag which is valid until changed again with this method.
     */
    setNotifyChange(notify) {
        this.notifyChange = notify;
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    getCommands() {
        return this.commands;
    }

    selectObjects() {
        let allObjectsSelected = true;
        for (let objId of this.selectObjectIds) {
            if (!this.rb.isSelectedObject(objId)) {
                allObjectsSelected = false;
                break;
            }
        }
        if (!allObjectsSelected) {
            // only select objects if at least one object is not already selected
            let firstSelection = true;
            for (let objId of this.selectObjectIds) {
                this.rb.selectObject(objId, firstSelection);
                firstSelection = false;
            }
        }
    }

    /**
     * Returns true if the command can replace the given other command.
     *
     * This information can be useful to avoid separate commands for every keystroke
     * in a text field and generate just one command for the whole changed text instead.
     * @param {Command} otherCmd
     * @returns {boolean}
     */
    allowReplace(otherCmd) {
        if (otherCmd instanceof CommandGroupCmd) {
            let otherCommands = otherCmd.getCommands();
            if (this.commands.length === otherCommands.length) {
                for (let i=0; i < this.commands.length; i++) {
                    if (!this.commands[i].allowReplace(otherCommands[i])) {
                        return false;
                    }
                }
                // we are allowed to replace all commands of the command group
                return true;
            }
        }
        return false;
    }

    /**
     * Must be called when the command replaces the other command.

     * This must only be called if allowReplace for the same command returned true.
     * @param {Command} otherCmd
     */
    replace(otherCmd) {
        let otherCommands = otherCmd.getCommands();
        for (let i=0; i < this.commands.length; i++) {
            this.commands[i].replace(otherCommands[i]);
        }
    }
}
