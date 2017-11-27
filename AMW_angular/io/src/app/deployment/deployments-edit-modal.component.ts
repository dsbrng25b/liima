import { Component, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Deployment } from './deployment';
import { DeploymentDetail } from './deployment-detail';
import { DeploymentService } from './deployment.service';
import { Datetimepicker } from 'eonasdan-bootstrap-datetimepicker';
import * as moment from 'moment';

declare var $: any;

@Component({
  selector: 'amw-deployments-edit-modal',
  templateUrl: './deployments-edit-modal.component.html'
})

export class DeploymentsEditModalComponent {

  @Input() deployments: Deployment[] = [];
  @Input() editActions: string[];
  @Input() deploymentDetailMap: { [key: number]: DeploymentDetail };

  @Output() editDeploymentDate: EventEmitter<Deployment> = new EventEmitter<Deployment>();
  @Output() errorMessage: EventEmitter<string> = new EventEmitter<string>();
  @Output() doReloadDeployment: EventEmitter<number> = new EventEmitter<number>();
  @Output() doConfirmDeployment: EventEmitter<DeploymentDetail> = new EventEmitter<DeploymentDetail>();
  @Output() doRejectDeployment: EventEmitter<Deployment> = new EventEmitter<Deployment>();
  @Output() doCancelDeployment: EventEmitter<Deployment> = new EventEmitter<Deployment>();

  confirmationAttributes: DeploymentDetail;
  deploymentDate: number; // for deployment date change in during confirmation
  selectedEditAction: string;

  constructor(private ngZone: NgZone,
              private deploymentService: DeploymentService) {
    this.confirmationAttributes = <DeploymentDetail> {};
  }

  changeEditAction() {
    if (this.selectedEditAction === this.editActions[1]) {
      // confirm
      this.addDatePicker();
    }
  }

  doEdit() {
    switch (this.selectedEditAction) {
      // date
      case this.editActions[0]:
        this.setSelectedDeploymentDates();
        break;
      // confirm
      case this.editActions[1]:
        this.confirmSelectedDeployments();
        break;
      // reject
      case this.editActions[2]:
        this.rejectSelectedDeployments();
        break;
      // cancel
      case this.editActions[3]:
        this.cancelSelectedDeployments();
        break;
      default:
        console.error('Unknown EditAction' + this.selectedEditAction);
        break;
    }
    $('#deploymentsEdit').modal('hide');
  }

  private applyConfirmationAttributesIntoDeploymentDetailAndDoConfirm(deploymentId: number) {
    let deploymentDetail = this.deploymentDetailMap[deploymentId];
    deploymentDetail.sendEmailWhenDeployed = this.confirmationAttributes.sendEmailWhenDeployed;
    deploymentDetail.simulateBeforeDeployment = this.confirmationAttributes.simulateBeforeDeployment;
    deploymentDetail.shakedownTestsWhenDeployed = this.confirmationAttributes.shakedownTestsWhenDeployed;
    deploymentDetail.neighbourhoodTest = this.confirmationAttributes.neighbourhoodTest;
    this.doConfirmDeployment.emit(deploymentDetail);
  }

  private confirmSelectedDeployments() {
    this.setSelectedDeploymentDates();
    for (let deployment of this.deployments) {
      this.deploymentService.getDeploymentDetail(deployment.id).subscribe(
        /* happy path */ (r) => this.deploymentDetailMap[deployment.id] = r,
        /* error path */ (e) => e,
        /* on complete */ () => this.applyConfirmationAttributesIntoDeploymentDetailAndDoConfirm(deployment.id)
      );
    };
  }

  private rejectSelectedDeployments() {
    for (let deployment of this.deployments) {
      this.doRejectDeployment.emit(deployment);
    }
  }

  private cancelSelectedDeployments() {
    for (let deployment of this.deployments) {
      this.doCancelDeployment.emit(deployment);
    }
  }

  private setSelectedDeploymentDates() {
    let dateTime = moment(this.deploymentDate, 'DD.MM.YYYY HH:mm');
    if (!dateTime || !dateTime.isValid()) {
      this.errorMessage.emit('Invalid date');
    } else {
      for (let deployment of this.deployments) {
        this.setDeploymentDate(deployment, dateTime.valueOf());
      }
    }
  }

  private setDeploymentDate(deployment: Deployment, deploymentDate: number) {
    this.deploymentService.setDeploymentDate(deployment.id, deploymentDate).subscribe(
      /* happy path */ (r) => r,
      /* error path */ (e) => this.errorMessage = this.errorMessage ? this.errorMessage + '<br>' + e : e,
      /* on complete */ () => this.doReloadDeployment.emit(deployment.id)
    );
  }

  private addDatePicker() {
    this.ngZone.onMicrotaskEmpty.first().subscribe(() => {
      $('.datepicker').datetimepicker({format: 'DD.MM.YYYY HH:mm'});
    });
  }
}
