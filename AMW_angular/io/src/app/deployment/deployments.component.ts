import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../app.service';
import { ComparatorFilterOption } from './comparator-filter-option';
import { DeploymentFilter } from './deployment-filter';
import { DeploymentFilterType } from './deployment-filter-type';
import { DeploymentService } from './deployment.service';
import * as _ from 'lodash';

@Component({
  selector: 'amw-deployments',
  templateUrl: './deployments.component.html'
})

export class DeploymentsComponent implements OnInit {

  // initially by queryParam
  paramFilters: DeploymentFilter[] = [];

  // valid for all, loaded once
  filterTypes: DeploymentFilterType[] = [];
  comparatorOptions: ComparatorFilterOption[] = [];
  comparatorOptionsMap: { [key: string]: string } = {};

  // available filterValues (if any)
  filterValueOptions: { [key: string]: string[] } = {};

  // to be added
  selectedFilterType: DeploymentFilterType;

  // already set
  filters: DeploymentFilter[] = [];

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
              private deploymentService: DeploymentService,
              public appState: AppState) {
  }

  ngOnInit() {

    this.appState.set('navShow', false);
    this.appState.set('navTitle', 'Deployments');
    this.appState.set('pageTitle', 'Deployments');

    console.log('hello `Deployments` component');

    this.activatedRoute.queryParams.subscribe(
      (param: any) => {
        if (param['filter']) {
          try {
            this.paramFilters = JSON.parse(param['filter']);
          } catch (e) {
            console.log(e);
            this.errorMessage = 'Error parsing filter';
          }
          //this.filters = JSON.parse(decodeURIComponent(param['filters']));
        }
    });

    this.initTypeAndOptions();

  }

  addType() {
    if (this.selectedFilterType) {
      console.log('type: ' + this.selectedFilterType.type);

      let newFilter: DeploymentFilter = <DeploymentFilter> {};

      if (!this.filterValueOptions[this.selectedFilterType.name]) {
        if (this.selectedFilterType.type === 'booleanType') {
          this.filterValueOptions[this.selectedFilterType.name] = [ 'true', 'false' ];
        } else {
          this.getFilterOptionValues(this.selectedFilterType.name);
        }
      }

      newFilter.name = this.selectedFilterType.name;
      newFilter.comp = 'eq';
      newFilter.val = this.selectedFilterType.type === 'booleanType' ? 'true' : '';
      newFilter.type = this.selectedFilterType.type;
      newFilter.compOptions = this.comparatorOptionsForType(this.selectedFilterType.type);
      this.filters.unshift(newFilter);
    }
  }

  removeFilter(filter: DeploymentFilter) {
    _.remove(this.filters, {name: filter.name})
  }

  private comparatorOptionsForType(filterType: string) {
    if (filterType === 'booleanType' || filterType === 'StringType' || filterType === 'ENUM_TYPE') {
      return [{name: 'eq', displayName: 'is'}];
    } else {
      return this.comparatorOptions;
    }
  }

  private initTypeAndOptions() {
    this.isLoading = true;
    this.deploymentService.getAllDeploymentFilterTypes().subscribe(
      /* happy path */ (r) => this.filterTypes = _.sortBy(r, 'name'),
      /* error path */ (e) => this.errorMessage = e,
      /* onComplete */ () => this.getAllComparatorOptions());
  }

  private getAllComparatorOptions() {
    this.deploymentService.getAllComparatorFilterOptions().subscribe(
      /* happy path */ (r) => this.comparatorOptions = r,
      /* error path */ (e) => this.errorMessage = e,
      /* onComplete */ () => { this.populateMap(), this.populateFilters(); });
  }

  private getFilterOptionValues(filterName: string) {
    this.isLoading = true;
    this.deploymentService.getFilterOptionValues(filterName).subscribe(
      /* happy path */ (r) => this.filterValueOptions[filterName] = r,
      /* error path */ (e) => this.errorMessage = e,
      /* onComplete */ () => this.isLoading = false);
  }

  private populateFilters() {
    if (this.paramFilters) {
      this.paramFilters.forEach((filter) => {
        let i: number = _.findIndex(this.filterTypes, ['name', filter.name])
        if (i >= 0) {
          filter.compOptions = this.comparatorOptionsForType(this.filterTypes[i].type);
          filter.type = this.filterTypes[i].type;
          this.filters.push(filter);
          this.filterValueOptions[filter.name] = [];
        } else {
          this.errorMessage = 'Error parsing filter';
        }
      })
    }
    this.isLoading = false;
  }

  private populateMap() {
    this.comparatorOptions.forEach((option) => {
      this.comparatorOptionsMap[option.name] = option.displayName;
    });
    this.isLoading = false;
  }

}


