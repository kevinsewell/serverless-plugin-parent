"use strict";

/**
 * @module serverless-plugin-parent
 *
 * @see {@link https://serverless.com/framework/docs/providers/aws/guide/plugins/}
 *
 * @requires "bluebird"
 * @requires "lodash"
 * @requires "js-yaml"
 * @requires "fs"
 * @requires "path"
 * */

const BbPromise = require("bluebird");
const _ = require("lodash");
const YAML = require("js-yaml");
const fs = require("fs");
const os = require("os");
const path = require("path");

/**
 * @classdesc Share common configuration between services
 * @class ServerlessPluginParent
 */
class ServerlessPluginParent {

    /**
     *
     * @param serverless
     * @param options
     */
    constructor(serverless, options) {
        this.serverless = serverless;

        this.options = options;

        this.commands = {
            parent: {
                usage: "Share configuration between services",
                lifecycleEvents: ["parent"],
                commands: {
                    effective: {
                        usage: "Print the effective serverless.yml",
                        lifecycleEvents: ["effective"]
                    }
                }
            }
        };

        this.hooks = {
            "parent:parent": this.printParentUsage.bind(this),
            "parent:effective:effective": this.printEffectiveConfig.bind(this)
        };

        this.mergeParentConfigurationIntoService();
    }

    /**
     * Print Parent Usage
     *
     * @returns {Promise}
     */
    printParentUsage() {
        this.serverless.cli.generateCommandsHelp(["parent"]);

        return BbPromise.resolve();
    }

    /**
     * Print Effective Serverless.yml
     *
     * @returns {Promise}
     */
    printEffectiveConfig() {

        const effectiveServiceConfig = {};
        const fieldsToOutput = ["custom", "functions", "package", "provider", "resources", "service"];

        fieldsToOutput.forEach(fieldName => {
            let fieldValue = this.serverless.service[fieldName];
            if (fieldValue && Object.keys(fieldValue).length > 0) {
                effectiveServiceConfig[fieldName] = fieldValue
            }
        });

        this.serverless.cli.log("Effective serverless.yml:\n" + YAML.dump(effectiveServiceConfig));

        return BbPromise.resolve();
    }

    /**
     * Merge parent configuration into service configuration
     *
     * @param configFilename
     */
    mergeParentConfigurationIntoService(configFilename) {

        const parentConfigurationFilename = this.getParentConfigurationRelativePath();

        const parentConfiguration = this.serverless.utils.readFileSync(parentConfigurationFilename);

        this.serverless.service = _.merge(this.serverless.service || {}, parentConfiguration);
    }

    /**
     * Search service paths recursively for Serverless configration fragment files
     *
     * @returns {*}
     */
    getParentConfigurationRelativePath() {

        if (this.serverless.service.custom &&
            this.serverless.service.custom.parent &&
            this.serverless.service.custom.parent.path) {

            if (this.serverless.service.custom.parent.path.indexOf(".yml") < 0) {
                return path.join(this.serverless.service.custom.parent.path, "serverless.yml");
            }

            return this.serverless.service.custom.parent.path;
        }

        let maxLevelsToSearch = (
            this.serverless.service.custom &&
            this.serverless.service.custom.parent &&
            this.serverless.service.custom.parent.maxLevels
        ) || 3;

        let relativePath = "..";

        while (!fs.existsSync(path.join(relativePath, "serverless.yml")) &&
        fs.realpathSync(relativePath) !== os.homedir() &&

        // Lets assume a max of 10 levels before giving up
        relativePath.length < (maxLevelsToSearch - 1) * 3) {
            relativePath = path.join(relativePath, "..")
        }

        if (!fs.existsSync(path.join(relativePath, "serverless.yml"))) {
            throw Error("Could not discover parent serverless.yml")
        }

        return path.join(relativePath, "serverless.yml");
    };
}

/** Export ServerlessPluginParent class */
module.exports = ServerlessPluginParent;
