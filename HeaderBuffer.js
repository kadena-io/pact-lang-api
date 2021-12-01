
/**
 * Items are expected to have the following properties:
 *
{
    header: {
        hash: {string},
        parent: {string},
        height: {number}
    }
}
*/

function HeaderBuffer(depth, callback) {

    /* The depth at which blocks are released */
    this.depth = depth;
    this.callback = callback;

    /* NOTE, that the element at index 0 is one block deeper than the release
     * depth. It is kept for one additional step in the buffer in order to verify
     * the consistency of the stream when depth is 0
     */

    /* block height at index 0 */
    this.curHeight = null;
    this.buffer = [];

    this.add = (u) => {
        const hdr = u.header;
        const h = hdr.height;

        // Empty buffer
        if (this.curHeight == null) {
            this.buffer[0] = { header: { hash: hdr.parent }};
            this.buffer[1] = u;
            this.curHeight = h-1;

        // Orphan check
        } else if (h <= this.curHeight) {
            throw `HeaderBuffer: confirmation depth violation: block at height ${h} got orphaned`

        // place item into buffer
        } else {
            const idx = h - this.curHeight;

            // double check consistency
            // maybe do this check only after shift below?
            const prevHash = this.buffer[idx - 1].header.hash;
            if (hdr.parent !== prevHash) {
                throw `HeaderBuffer: inconsistent chain at height ${h}. Parent ${prevHash} doesn't match expected value ${hdr.parent}`
            }

            this.buffer[idx] = u;
        }

        // shift and call callback
        while (this.buffer.length - 1 > depth) {
            this.buffer.shift();
            const b = this.buffer[0];
            this.curHeight += 1;
            if (b) {
                this.callback(b);
            } else {
                throw `HeaderBuffer: missing block at height ${this.curHeight}`
            }
        }
    }
}

module.exports = HeaderBuffer;
