import SetValueCmd from './SetValueCmd';

/**
 * Command container for multiple commands. All commands of this container will be executed in a single do/undo operation.
 * @class
 */
export default class CommandGroupCmd {
    constructor(name, rb) {
        this.name;
        this.rb = rb;
        this.commands = [];
        this.selectObjects = false;
    }

    getName() {
        return this.name;
    }

    do() {
        let selectObjects = this.isSelectObjectsNeeded();
        for (let i=0; i < this.commands.length; i++) {
            let cmd = this.commands[i];
            if (selectObjects && cmd instanceof SetValueCmd) {
                this.rb.selectObject(cmd.getObjId(), i === 0);
            }
            cmd.do();
        }
    }

    undo() {
        let selectObjects = this.isSelectObjectsNeeded();
        for (let i=this.commands.length - 1; i >= 0; i--) {
            let cmd = this.commands[i];
            if (selectObjects && cmd instanceof SetValueCmd) {
                this.rb.selectObject(cmd.getObjId(), i === (this.commands.length - 1));
            }
            cmd.undo();
        }
    }

    addCommand(cmd) {
        if (this.selectObjects && cmd instanceof SetValueCmd) {
            cmd.disableSelect();
        }
        this.commands.push(cmd);
    }

    isEmpty() {
        return this.commands.length === 0;
    }

    getCommands() {
        return this.commands;
    }

    handleSelection() {
        this.selectObjects = true;
    }

    /**
     * Test if it is necessary to select object before executing command.
     *
     * If the commands to be executed contain the same objects as the current selection then
     * no selection is needed.
     * @returns {boolean}
     */
    isSelectObjectsNeeded() {
        if (this.selectObjects) {
            for (let i=0; i < this.commands.length; i++) {
                let cmd = this.commands[i];
                if (cmd instanceof SetValueCmd) {
                    if (!this.rb.isSelectedObject(cmd.getObjId())) {
                        return true;
                    }
                }
            }
            return false;
        }
        return false;
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
