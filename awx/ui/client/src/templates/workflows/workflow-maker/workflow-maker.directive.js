/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import workflowMakerController from './workflow-maker.controller';

export default ['templateUrl', 'CreateDialog', 'Wait', '$state', '$window',
    function(templateUrl, CreateDialog, Wait, $state, $window) {
        return {
            scope: {
                workflowJobTemplateObj: '=',
                canAddWorkflowJobTemplate: '='
            },
            restrict: 'E',
            templateUrl: templateUrl('templates/workflows/workflow-maker/workflow-maker'),
            controller: workflowMakerController,
            link: function(scope) {

                let availableHeight = $(window).height(),
                    availableWidth = $(window).width(),
                    minimumWidth = 1300,
                    minimumHeight = 550;

                CreateDialog({
                    id: 'workflow-modal-dialog',
                    scope: scope,
                    width: availableWidth > minimumWidth ? availableWidth : minimumWidth,
                    height: availableHeight > minimumHeight ? availableHeight : minimumHeight,
                    draggable: false,
                    dialogClass: 'SurveyMaker-dialog',
                    position: ['center', 20],
                    onClose: function() {
                        $('#workflow-modal-dialog').empty();
                    },
                    onOpen: function() {
                        Wait('stop');

                        // Let the modal height be variable based on the content
                        // and set a uniform padding
                        $('#workflow-modal-dialog').css({ 'padding': '20px' });
                        $('#workflow-modal-dialog').parent('.ui-dialog').height(availableHeight > minimumHeight ? availableHeight : minimumHeight);
                        $('#workflow-modal-dialog').parent('.ui-dialog').width(availableWidth > minimumWidth ? availableWidth : minimumWidth);
                        $('#workflow-modal-dialog').outerHeight(availableHeight > minimumHeight ? availableHeight : minimumHeight);
                        $('#workflow-modal-dialog').outerWidth(availableWidth > minimumWidth ? availableWidth : minimumWidth);

                    },
                    _allowInteraction: function(e) {
                        return !!$(e.target).is('.select2-input') || this._super(e);
                    },
                    callback: 'WorkflowDialogReady'
                });
                if (scope.removeWorkflowDialogReady) {
                    scope.removeWorkflowDialogReady();
                }
                scope.removeWorkflowDialogReady = scope.$on('WorkflowDialogReady', function() {
                    $('#workflow-modal-dialog').dialog('open');

                    scope.$broadcast("refreshWorkflowChart");
                });

                scope.closeDialog = function() {
                    $('#workflow-modal-dialog').dialog('destroy');

                    $state.go('^');
                };

                function onResize(){
                    availableHeight = $(window).height();
                    availableWidth = $(window).width();
                    $('#workflow-modal-dialog').parent('.ui-dialog').height(availableHeight > minimumHeight ? availableHeight : minimumHeight);
                    $('#workflow-modal-dialog').parent('.ui-dialog').width(availableWidth > minimumWidth ? availableWidth : minimumWidth);
                    $('#workflow-modal-dialog').outerHeight(availableHeight > minimumHeight ? availableHeight : minimumHeight);
                    $('#workflow-modal-dialog').outerWidth(availableWidth > minimumWidth ? availableWidth : minimumWidth);

                    scope.$broadcast('workflowMakerModalResized');
                }

                function cleanUpResize() {
                    angular.element($window).off('resize', onResize);
                }

                angular.element($window).on('resize', onResize);
                scope.$on('$destroy', cleanUpResize);
            }
        };
    }
];
