module.exports.register = function(handlebars) {

    /**
     * Outputs a modifier's markup, if possible.
     * @param  {Object} modifier Specify a particular modifier object. Defaults to the current modifier.
     */
    handlebars.registerHelper('markupId', function(modifier) {

        modifier = arguments.length < 2 ? this : modifier || this || false;

        if (!modifier) {
            return false;
        }

        var fixName = function(str) {
            return str.replace(/[#.]/g, '-');
        }

        if (!modifier.section || !modifier.section.data) {
            return "s" + fixName(modifier.reference);
        }

        return "s" + fixName(modifier.section.data.reference) + fixName(modifier.className);
    });
};
