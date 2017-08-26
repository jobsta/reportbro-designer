/**
 * Interface for all commands.
 * @class
 */
export default class Command {
    getName() {}
    do() {}
    undo() {}
}

Command.operation = {
    rename: 'rename',
    change: 'change',
    add: 'add',
    remove: 'remove',
    move: 'move'
}