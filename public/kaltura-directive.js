/**
 * kaltura-embed directive.
 */
angular.module('jsf', []).directive('kalturaPlayer', function () {
    return {
        restrict: "A,E",
        replace: false,
        transclude: false,
        compile: function (element, attrs) {

            // Generate new div id for the player injection.
            var generatedDivId = attrs.id + '_kaltura';

            // Add a new div with an id which is based on the parent's id.
            var playerDiv = '<div id="' + generatedDivId + '">' + '</div>';
            jQuery(element).html(playerDiv);

            // We return the linking function.
            return function ($scope, element, attrs, controller) {

                // Get the config object as indicated in the attributes from the scope.
                var configObject = $scope[attrs.kalturaOptions];

                // Set the mwEmbed configuration.
                for (var name in $scope.config.mw) {
                    if (configObject.mw.hasOwnProperty(name)) {
                        mw.setConfig(name, configObject.mw[name]);
                    }
                }

                // Set the target id attribute using the containing element id.
                configObject.widget.targetId = generatedDivId;

                // Embed the kWidget.
                kWidget.embed(configObject.widget);
            };

        }
    };
})
    .controller('VideoCtrl', function ($scope) {
    $scope.config = {};

    $scope.config.widget = {
        'wid': '_243342',
            'uiconf_id': '2877502',
            'entry_id': '1_kl3ya2w5',
            'flashvars': {
            'externalInterfaceDisabled': false,
                'autoPlay': true
        }
    };

    $scope.config.mw = {
        'Kaltura.LeadWithHTML5': true,
            'debug': false,
            'Mw.XmlProxyUrl': 'http://player.kaltura.com//simplePhpXMLProxy.php',
            'Kaltura.UseManifestUrls': true,
            'Kaltura.Protocol': 'http',
            'Kaltura.ServiceUrl': 'http://cdnapi.kaltura.com',
            'Kaltura.ServiceBase': '/api_v3/index.php?service=',
            'Kaltura.CdnUrl': 'http://cdnbakmi.kaltura.com',
            'Kaltura.StatsServiceUrl': 'http://stats.kaltura.com',
            'Kaltura.IframeRewrite': true,
            'EmbedPlayer.EnableIpadHTMLControls': true,
            'EmbedPlayer.UseFlashOnAndroid': false,
            'Kaltura.LoadScriptForVideoTags': true,
            'Kaltura.AllowIframeRemoteService': false,
            'Kaltura.UseAppleAdaptive': true,
            'Kaltura.EnableEmbedUiConfJs': false,
            'Kaltura.PageGoogleAalytics': 'UA-2078931-34'
    };

});