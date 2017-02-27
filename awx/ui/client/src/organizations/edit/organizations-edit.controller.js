/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

export default ['$scope', '$rootScope', '$location', '$log', '$stateParams',
    'OrganizationForm', 'Rest', 'Alert', 'ProcessErrors', 'Prompt', 'ClearScope',
    'GetBasePath', 'Wait', '$state', 'ToggleNotification',
    function($scope, $rootScope, $location, $log, $stateParams,
        OrganizationForm, Rest, Alert, ProcessErrors, Prompt, ClearScope,
        GetBasePath, Wait, $state, ToggleNotification) {

        ClearScope();

        var form = OrganizationForm(),
            defaultUrl = GetBasePath('organizations'),
            base = $location.path().replace(/^\//, '').split('/')[0],
            master = {},
            id = $stateParams.organization_id;

        init();

        function init() {
            $scope.$watch('organization_obj.summary_fields.user_capabilities.edit', function(val) {
                if (val === false) {
                    $scope.canAdd = false;
                }
            });

            $scope.$emit("HideOrgListHeader");
            $scope.organization_id = id;
        }

        // Retrieve detail record and prepopulate the form
        Wait('start');
        Rest.setUrl(defaultUrl + id + '/');
        Rest.get()
            .success(function(data) {
                var fld;
                $scope.organization_name = data.name;
                for (fld in form.fields) {
                    if (data[fld]) {
                        $scope[fld] = data[fld];
                        master[fld] = data[fld];
                    }
                }
                $scope.organization_obj = data;
                $scope.$emit('organizationLoaded');
                Wait('stop');
            })
            .error(function(data, status) {
                ProcessErrors($scope, data, status, form, {
                    hdr: 'Error!',
                    msg: 'Failed to retrieve organization: ' + $stateParams.id + '. GET status: ' + status
                });
            });

        $scope.toggleNotification = function(event, id, column) {
            var notifier = this.notification;
            try {
                $(event.target).tooltip('hide');
            } catch (e) {
                // ignore
            }
            ToggleNotification({
                scope: $scope,
                url: defaultUrl,
                id: $scope.organization_id,
                notifier: notifier,
                column: column,
                callback: 'NotificationRefresh'
            });
        };

        // Save changes to the parent
        $scope.formSave = function() {
            var fld, params = {};
            Wait('start');
            for (fld in form.fields) {
                params[fld] = $scope[fld];
            }
            Rest.setUrl(defaultUrl + id + '/');
            Rest.put(params)
                .success(function() {
                    Wait('stop');
                    $scope.organization_name = $scope.name;
                    master = params;
                    $state.go($state.current, {}, { reload: true });
                })
                .error(function(data, status) {
                    ProcessErrors($scope, data, status, OrganizationForm, {
                        hdr: 'Error!',
                        msg: 'Failed to update organization: ' + id + '. PUT status: ' + status
                    });
                });
        };

        $scope.formCancel = function() {
            $state.go('organizations');
            $scope.$emit("ShowOrgListHeader");
        };

        // Related set: Add button
        $scope.add = function(set) {
            $location.path('/' + base + '/' + $stateParams.organization_id + '/' + set);
        };

        // Related set: Edit button
        $scope.edit = function(set, id) {
            $location.path('/' + set + '/' + id);
        };

        // Related set: Delete button
        $scope['delete'] = function(set, itm_id, name, title) {

            var action = function() {
                Wait('start');
                var url = defaultUrl + $stateParams.organization_id + '/' + set + '/';
                Rest.setUrl(url);
                Rest.post({ id: itm_id, disassociate: 1 })
                    .success(function() {
                        $('#prompt-modal').modal('hide');

                        // @issue: OLD SEARCH
                        // $scope.search(form.related[set].iterator);
                    })
                    .error(function(data, status) {
                        $('#prompt-modal').modal('hide');
                        ProcessErrors($scope, data, status, null, {
                            hdr: 'Error!',
                            msg: 'Call to ' + url + ' failed. POST returned status: ' + status
                        });
                    });
            };

            Prompt({
                hdr: 'Delete',
                body: '<div class="Prompt-bodyQuery">Are you sure you want to remove the ' + title + ' below from ' + $scope.name + '?</div><div class="Prompt-bodyTarget">' + name + '</div>',
                action: action,
                actionText: 'DELETE'
            });

        };
    }
];
