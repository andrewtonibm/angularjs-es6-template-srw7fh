class HomeCtrl {
  static $inject = ['appService', 'dialogService', 'alertService', 'store', '$location', '$log', '$rootScope', 'LoadingSpinnerService', 'SecurityService'];

  constructor(appService, dialogService, alertService, store, $location, $log, $rootScope, LoadingSpinnerService, SecurityService) {
    this.appService = appService;
    this.alertService = alertService;
    this.dialogService = dialogService;
    this.store = store;

    	var $ctrl = this;
			$ctrl.error = null;
			$ctrl.login = login;
			$ctrl.userMaxSessionError = false;
			$ctrl.userTerminatedError = false;
			$ctrl.userTypeInvalidError = false;
			$ctrl.userUnknownError = false;
			$ctrl.user = null;


			function login($event) {

				$log.debug("<-- LOGIN to SWARM -->");
				$event.preventDefault();
				LoadingSpinnerService.showElementLoading(angular.element($event.target));

				SecurityService.loginUser()
					.then(function() {

						// Allows users with deep links to continue to their intended route
						if ($rootScope.entryUrl != '/login') {
							LoadingSpinnerService.hideElementLoading(angular.element($event.target));
							$location.path($rootScope.entryUrl);
						} else {
							LoadingSpinnerService.hideElementLoading(angular.element($event.target));
							$location.path('/home');
						}

					})
					.catch(function(loginError) {

						switch (loginError.error) {

							case 'USER_NOT_FOUND':

								$log.debug("User Not Found for SID: ", loginError.sid);
								$rootScope.user.sid = loginError.sid;
								$location.path('/admin/new-user');
								break;

							case 'USER_TERMINATED':

								$log.debug("User was Terminated: " + loginError.user);
								$rootScope.user.sid = loginError.user.SID;
								$ctrl.userTerminatedError = true;
								$ctrl.user = loginError.user;
								break;

							case 'USER_TYPE_INVALID':

								$log.debug("User Type is Invalid: " + loginError.user);
								$rootScope.user.sid = loginError.user.SID;
								$ctrl.userTypeInvalidError = true;
								$ctrl.user = loginError.user;
								break;

							case 'MAX_CONCURRENT_SESSIONS':

								$log.debug("User was Terminated: " + loginError.user);
								$rootScope.user.sid = loginError.user.SID;
								$ctrl.userMaxSessionError = true;
								$ctrl.user = loginError.user;
								break;

							default:

								$ctrl.userUnknownError = true;
								$ctrl.error = loginError;
								$rootScope.user.sid = "UNKNOWN";
								$rootScope.user.roles = [];
								$rootScope.user.userType = null;

						}
						LoadingSpinnerService.hideElementLoading(angular.element($event.target));

					});

			}

  }

  showDialog() {
    this.dialogService.show('Hello Dialog', 'Some Dialog Content.')
      .then((res) => {
        this.alertService.show('OK!', 'You clicked ok', { id: 'OK_ID' });
      })
      .catch((err) => {
        this.alertService.show('CANCELED!', 'You clicked cancel', { type: 'danger', id: 'CANCEL_ID' });
      });
  }

  messageSubscription() {
    this.appService.emit('HomeComponent: some message');
  }

  showRandomAlert() {
    let alertTypes = ['primary', 'info', 'warning', 'success', 'danger'];
    let rndTypeIndex = Math.floor(Math.random() * alertTypes.length) + 1;
    this.alertService.show('Test!', 'Some test text', { type: alertTypes[rndTypeIndex] });
  }

  incrementCount() {
    this.store.incrementCount();
  }
}

export default {
  bindings: {},
  templateUrl: 'home/home.component.html',
  controller: HomeCtrl
}