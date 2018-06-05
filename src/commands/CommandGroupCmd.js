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
    }

    getName() {
        return this.name;
    }

    do() {
        for (let i=0; i < this.commands.length; i++) {
            this.commands[i].do();
        }
    }

    undo() {
        for (let i=this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }

    addCommand(cmd) {
        if (this.commands.length > 0 && cmd instanceof SetValueCmd) {
            cmd.disableSelect();
        }
        this.commands.push(cmd);
    }

    isEmpty() {
        return this.commands.length === 0;
    }
}
