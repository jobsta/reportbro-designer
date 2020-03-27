/**
 * Base class for all commands.
 * @class
 */
export default class Command {
    constructor() {
    }

    getName() {}
    do() {}
    undo() {}

    /**
     * Returns true if the command can replace the given other command.
     * @param {Command} otherCmd
     * @returns {boolean}
     */
    allowReplace(otherCmd) {
        return false;
    }

    /**
     * Must be called when the command replaces the other command.

     * This must only be called if allowReplace for the same command returned true.
     * @param {Command} otherCmd
     */
    replace(otherCmd) {
    }
}

Command.operation = {
    rename: 'rename',
    change: 'change',
    add: 'add',
    remove: 'remove',
    move: 'move'
}