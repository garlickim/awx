/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

export default
    angular.module('sanitizeFilter', []).filter('sanitize', function() {
      return function(input) {
        input = $("<span>").text(input)[0].innerHTML;
        return input;
      };
    });
