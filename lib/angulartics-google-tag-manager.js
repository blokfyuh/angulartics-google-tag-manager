/**
 * @license Angulartics v0.19.2
 * (c) 2013 Luis Farzati http://luisfarzati.github.io/angulartics
 * Google Tag Manager Plugin Contributed by http://github.com/danrowe49
 * License: MIT
 */

(function (angular) {
  'use strict';


  /**
   * @ngdoc overview
   * @name angulartics.google.analytics
   * Enables analytics support for Google Tag Manager (http://google.com/tagmanager)
   */

  angular.module('angulartics.google.tagmanager', ['angulartics'])
    .config(['$analyticsProvider', function ($analyticsProvider) {

      $analyticsProvider.settings.ga = {
        userId: null
      };

      /**
       * Send content views to the dataLayer
       *
       * @param {string} path Required 'content name' (string) describes the content loaded
       */

      $analyticsProvider.registerPageTrack(function (path, $location, resolvedData) {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        var pushData = function(resource) {
          dataLayer.push({
            'event': 'content-view',
            'content-name': path,
            'userId': $analyticsProvider.settings.ga.userId,
            'dimension3': resource && _.isFunction(resource.getAnalyticsDimension) ? resource.getAnalyticsDimension('who') : undefined
          });
        }
        if (resolvedData && resolvedData.resource && resolvedData.resource.$promise) {
          return resolvedData.resource.$promise.then(function(resource) {
              pushData(resource);
          });
        }
        pushData();
      });

      /**
       * Send interactions to the dataLayer, i.e. for event tracking in Google Analytics
       * @name eventTrack
       *
       * @param {string} action Required 'action' (string) associated with the event
       * @param {object} properties Comprised of the mandatory field 'category' (string) and optional  fields 'label' (string), 'value' (integer) and 'noninteraction' (boolean)
       */
      
      function dimensionsAndMetrics(properties) {
        for (var customData = {}, idx = 1; idx <= 200; idx++) {
          customData["dimension" + idx] = "undefined" != typeof properties["dimension" + idx] ? properties["dimension" + idx] : null;
          customData["metric" + idx] = "undefined" != typeof properties["metric" + idx] ? properties["metric" + idx] : null;
        }
        return customData
      }
      
      $analyticsProvider.registerEventTrack(eventTrack);
      
      function eventTrack(action, properties) {
        var dataLayer = window.dataLayer = window.dataLayer || [];
        properties = properties || {};
        var dimsAndMets = dimensionsAndMetrics(properties);
        dataLayer.push(angular.extend({
          'event': properties.event || 'interaction',
          'target': properties.category,
          'action': action,
          'target-properties': properties.label,
          'value': properties.value,
          'interaction-type': properties.noninteraction,
          'userId': $analyticsProvider.settings.ga.userId
        }, dimsAndMets));
      }

      /**
       * Send exceptions to the dataLayer, reusing the existing Event Tracking tag in GTM
       * @name exceptionTrack
       *
       * @param {object} error An Error object to track: error.toString() used for event 'action', error.stack used for event 'label'.
       * @param {object} cause The cause of the error given from $exceptionHandler, not used
       */

      $analyticsProvider.registerExceptionTrack(function(error, cause) {
       
        eventTrack(error.toString(), {
          'category': 'Exceptions',
          'label': error.stack
        });

      });

      /**
       * Set userId for use with Universal Analytics User ID feature
       * @name setUsername
       * 
       * @param {string} userId Required 'userId' value (string) used to identify user cross-device in Google Analytics
       */

      $analyticsProvider.registerSetUsername(function (userId) {
        $analyticsProvider.settings.ga.userId = userId;
      });

    }]);

})(angular);
