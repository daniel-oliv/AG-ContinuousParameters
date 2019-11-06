import { Component, OnInit } from "@angular/core";

declare var Plotly: any;


@Component({
  selector: "app-config-painel",
  templateUrl: "./config-painel.component.html",
  styleUrls: ["./config-painel.component.css"]
})
export class ConfigPainelComponent implements OnInit {
  probMutacao: number;
  probCruzamento: number;
  graphResolution: number;
  populationSize: number;
  
  varConfigurations: VarConfiguration[];
  numOfVariables: number;

  x1GraphValues: number[];
  x2GraphValues: number[];

  ///min and max of f(x1, x2)
  minFunctionInTheInterval: number;
  maxFunctionInTheInterval: number;

  maxNumOfGenerations: number;
  bestInd: individual[];
  numOfBestToKeep: number;
  numCurrentGeneration: number;
  generations: any[];
  couplesSelectionMode: string;
  mutationMode: string;
  crossoverMode: string;
  checkBoxSelectedItens: string[];
  numOfIndividualsInTourney: number;
  numOfElitismInd: number;
  //graphData: any;
  //functionDataSet: any;
  //generationsDataSets: any[];

  trace3D: any;
  layout3D: any;

  //zRealValues: number[][];
  zRealValuesVec: number[];
  zRealValuesGraph: number[];
  colors: string[];
  color: number;
  isGraphResponsive: boolean;
  showGraph1: string;
  showGraph2: string;
  performanceData: any;
  bestIndividualData: any;
  wrightChildrenHistogram: number[];
  wrightExpressions: any[];

  fitnessConstant: number;
  constPenalty: number;

  constructor() {}

  ngOnInit() 
  {
    console.log("ngOnInit");

    this.probCruzamento = 0.6;
    this.probMutacao = 0.01;
    this.constPenalty = 1000;
    this.numOfVariables = 2;
    this.graphResolution = 10;
    this.populationSize = 100;
    
    this.initConfigVars();

    this.maxNumOfGenerations = 120;
    this.bestInd = [];
    this.numOfBestToKeep = 5;
    this.numCurrentGeneration = 0;
    this.generations = [];
    this.isGraphResponsive = true;
    this.showGraph1 = 'block';
    this.showGraph2 = 'none';
    //this.initGensDataset();
    this.drawFunction();
    this.couplesSelectionMode = "Torneio";
    this.mutationMode = "Gene";
    this.crossoverMode = "Wright";
    this.checkBoxSelectedItens = ["elitism"];
    this.numOfIndividualsInTourney = 4;
    this.numOfElitismInd = 2;
    
    this.wrightExpressions = [
      (valueP1: number, valueP2: number) => {return 0.5 * valueP1 + 0.5 * valueP2},
      (valueP1: number, valueP2: number) => {return 1.5 * valueP1 - 0.5 * valueP2},
      (valueP1: number, valueP2: number) => {return 0.5 * valueP1 + 1.5 * valueP2}
    ]

    //this.fitnessConstant = this.calcFitnessConstant();
  }

  // calcFitnessConstant(): number
  // {
  //   return 11.1;
  // }

  initConfigVars()
  {
    this.varConfigurations = [];
    for (let i = 0; i < this.numOfVariables; i++) 
    {
      let xConfig: VarConfiguration = {
        name: 'x'+(i+1),
        intervalMin: -3,
        intervalMax: 5
      }
      this.varConfigurations.push(xConfig);
    }
  }

  numOfNewIndividual() 
  {
    let numOfNewIndividual: number;

    if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
    {
      numOfNewIndividual = this.populationSize - this.numOfElitismInd;
    } 
    else
    {
      numOfNewIndividual = this.populationSize;
    }

    return numOfNewIndividual;
  }

  initGensDataset() 
  {
    //console.log("initGensDataset");
    this.initIntervalData();
    ///////this.generationsDataSets = [];
    this.color = 0;
    this.colors = [];
  }

  initIntervalData() 
  {
    //console.log("initIntervalData");
    // this.zRealValues = [];
    this.zRealValuesVec = [];
    this.zRealValuesGraph = [];
    this.x1GraphValues = [];
    this.x2GraphValues = [];

    for (let varConfig of this.varConfigurations) {
      this.getIntervalLabels(varConfig)
    }

    for (let ix1=0; ix1<this.varConfigurations[0].xRealValues.length; ix1+=15) 
    {
      let x1 = this.varConfigurations[0].xRealValues[ix1];
      for (let ix2=0; ix2<this.varConfigurations[1].xRealValues.length; ix2+=15)
      {
        let x2 = this.varConfigurations[1].xRealValues[ix2];
        this.x1GraphValues.push(x1);
        this.x2GraphValues.push(x2);
        //x1Const.push(this.functionToAnaliseNuns(x1, x2));
        this.zRealValuesGraph.push(this.functionToAnaliseNuns(x1, x2));
      }
      // this.zRealValues.push(x1Const);
    }

    ///for fill the complete zValues vector, since zRealValuesGraph is just for the graph, because it has a smaller resolution
    for (let x1 of this.varConfigurations[0].xRealValues) 
    {
      for (let x2 of this.varConfigurations[1].xRealValues)
      {
        this.zRealValuesVec.push(this.functionToAnaliseNuns(x1, x2));
      }
    }

    //this.minFunctionInTheInterval = this.minMatrix(this.zRealValues);
    //this.maxFunctionInTheInterval = this.maxMatrix(this.zRealValues);
    //this.minFunctionInTheInterval = this.getMinConditioned(this.zRealValuesVec, this.varConfigurations[0].xRealValues, this.varConfigurations[1].xRealValues);
    this.minFunctionInTheInterval = this.minArray(this.zRealValuesVec);
    this.maxFunctionInTheInterval = this.maxArray(this.zRealValuesVec);
    //console.log("zRealValues: ", this.zRealValues);
    console.log("minFunctionInTheInterval: " + this.minFunctionInTheInterval);
    console.log("maxFunctionInTheInterval: " + this.maxFunctionInTheInterval);
  }

  minMatrix(matrix: number[][]) 
  {
    let minValue = matrix[0][0];
    for (let x1Index = 1; x1Index < matrix.length; x1Index++) 
    {
      for (let x2Index = 1; x2Index < matrix[x1Index].length; x2Index++) 
      {
        if (minValue > matrix[x1Index][x2Index]) minValue = matrix[x1Index][x2Index];
      } 
    }
    return minValue;
  }

  getMinConditioned(arr: number[], x1Array:number[], x2Array:number[])
  {
    let minValue = arr[0];
    for (let index = 1; index < arr.length; index++) 
    {
      ///se o minValue é mario que o elemento do array, então ele não o menor e deve ser trocado
      if (minValue > arr[index] && this.respectConditions(x1Array[index], x2Array[index])) minValue = arr[index];
    }
    
    return minValue;
  }

  respectConditions(x1: number, x2: number):boolean
  {
    let tolerancia = 2;
    return ( (x1 + x2 - 0.5 <= 0) && (x1 - x2 - 2 >= 0 -tolerancia && x1 - x2 - 2 <= 0 +tolerancia))
  }

  minArray(arr: number[]) 
  {
    let minValue = arr[0];
    for (let index = 1; index < arr.length; index++) 
    {
      ///se o minValue é mario que o elemento do array, então ele não o menor e deve ser trocado
      if (minValue > arr[index]) minValue = arr[index];
    }
    return minValue;
  }

  maxMatrix(matrix: number[][]) 
  {
    let maxValue = matrix[0][0];
    for (let x1Index = 1; x1Index < matrix.length; x1Index++) 
    {
      for (let x2Index = 1; x2Index < matrix[x1Index].length; x2Index++) 
      {
        if (maxValue < matrix[x1Index][x2Index]) maxValue = matrix[x1Index][x2Index];
      } 
    }
    return maxValue;
  }

  maxArray(arr: number[]) 
  {
    let maxValue = arr[0];
    for (let index = 1; index < arr.length; index++) {
      if (maxValue < arr[index]) maxValue = arr[index];
    }
    return maxValue;
  }

  getColorStr() 
  {
    return (
      "#" +
      this.color
        .toString(16)
        .toLocaleUpperCase()
        .padStart(6, "0")
    );
  }

  drawFunction() 
  {
    //console.log("drawFunction");
    Plotly.purge('3dGraph');
    //console.log(aditionalDatasets);
    this.initIntervalData();
    this.trace3D = 
    {
      x: this.x1GraphValues, 
      y: this.x2GraphValues, 
      z: this.zRealValuesGraph,
      opacity:0.5,
      mode: "markers",
      type: "mesh3d",
      scene: "scene",
      name: 'Function f'
    };

    this.layout3D = 
    {
      scene:{
          aspectmode:'auto',
          //aspectmode:'data',
          //aspectmode:'auto',
          //aspectmode:'manual',
          domain:{row:0, column:0}
      },
      grid:{
          pattern: 'independent',
          rows:0,
          columns:0
      }
  
    };
    //console.log("drawFunction trace", this.trace3D);
    Plotly.plot('3dGraph', [this.trace3D], this.layout3D, {showSendToCloud:false});

  }

  plotPerformanceGraph(generations: individual[][]) 
  {
    ///filling a vector with the generation numbers
    //console.log("plotPerformanceGraph");
    let xValues = [];
    for (let i = 0; i <= this.maxNumOfGenerations; i++) {
      xValues.push(i);
    }
    //console.log("xValues");
    //console.log(xValues);
    ///filling data (y values - best individuals fitness and average for every generation)
    let datasets: any[] = [];
    let bestIndividualFitnessDataset = {
      label: "Best individual",
      data: generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      }),
      backgroundColor: undefined,
      borderColor: "#000000",
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 2
      //showLine: false // no line shown
    };
    //console.log("generations");
    /* console.log(
      generations.map(element => {
        return this.bestIndividualFromAscendingPop(element).fitness;
      })
    ); */

    let averageFitnessDataset = {
      label: "Average fitness",
      data: generations.map(element => {
        return this.calcFitnessAverage(element);
      }),
      backgroundColor: "#eeeeff",
      borderColor: "#0000ff",
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: true
      // showLine: false // no line shown
    };

    ///adding to the datasets graph
    datasets.push(bestIndividualFitnessDataset);
    datasets.push(averageFitnessDataset);

    ///updating the variable that were binded to the performance graph data
    this.performanceData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets
    };

    this.bestIndividualData = {
      animationEnabled: false, //change to false
      labels: xValues,
      datasets: [bestIndividualFitnessDataset]
    };
  }

  getDataSetGeneration(generations: individual[][]) 
  {
    let gensDataset: any[] = [];
    //console.log(generation);
    for (let i = 0; i < generations.length; i++) 
    {
      let data = [];

      data.fill(null, 0, this.populationSize);
      for (let indiv of generations[i]) 
      {
        //console.log("getDataSetGeneration")
        //console.log(indiv);
        ///////let indivIndex = this.xRealValues.indexOf(indiv.realNumber);
        ///////data[indivIndex] = this.functionDataSet.data[indivIndex];
      }

      let genDataset = {
        label: "Geração " + i,
        data,
        backgroundColor: undefined,
        borderColor: "#FF0000",
        fill: false,
        borderDash: [5, 5],
        pointRadius: 15,
        pointHoverRadius: 10
      };

      gensDataset.push(genDataset);
    }

    return gensDataset;
  }

  /////////////////////

  optimize() 
  {
    //console.log("optimize");

    ///restarting the variables

    //this.initGensDataset();
    
    this.initConfigVars();
    //this.fitnessConstant = this.calcFitnessConstant();

    this.drawFunction();

    this.wrightChildrenHistogram = [0, 0, 0];

    this.generations = [];

    /// melhores indivíduos para a tabela
    this.bestInd = [];

    /// número da geração atual
    this.numCurrentGeneration = 0;

    let initialPopulation = this.selectInitialPopulation();

    ///getting a list starting with the worst individual
    let currentGeneration = this.getDescendingFitnessPopulation(initialPopulation);

    this.generations.push(currentGeneration);

    /// operations that we do for every generation
    while (this.generations.length <= this.maxNumOfGenerations) 
    {
      this.numCurrentGeneration++;

      ///this is not need since we are ordering in the end of the "for"
      //currentGeneration = this.getDescendingFitnessPopulation(currentGeneration);

      //console.log(currentGeneration);
      let nextGeneration: individual[] = [];
      let individualsToKeep: individual[] = [];

      /// if elitism is enable
      if (this.checkBoxSelectedItens.indexOf("elitism") >= 0) 
      {
        individualsToKeep = this.bestIndividualsFromAscendingPop(currentGeneration, this.numOfElitismInd);
      }

      this.applyCrossover(currentGeneration, nextGeneration);

      ///console here will show the final next population, since chrome update the objects in console
      this.applyMutation(nextGeneration);

      //console.log(nextGeneration);

      ///concating the best individuals that were kept
      nextGeneration = nextGeneration.concat(individualsToKeep);

      ///for keeping ordered lists
      nextGeneration = this.getDescendingFitnessPopulation(nextGeneration);

      this.generations.push(nextGeneration);
      currentGeneration = nextGeneration;
    }///while

    ///updating graphs
    ///////this.generationsDataSets = this.getDataSetGeneration(this.generations);
    ///////for (let i = 0; i < this.generations.length; i++) 
    ///////{
    ///////  setTimeout(() => {
    ///////    this.drawFunction(this.generationsDataSets.slice(i, i + 1));
    ///////  }, i * 2);
    ///////}
    this.plotPerformanceGraph(this.generations);
    //this.generationsDataSets.push(this.getDataSetGeneration(this.generations[0]));
    console.log(this.wrightChildrenHistogram);
    //console.log(this.generations);
  }

  getAscendingFitnessPopulation(population: individual[]): individual[] {
    //console.log("original")
    //console.log(population)
    let ordered: individual[] = [];
    ordered.push(population[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < population.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        //console.log("j" + ordered[j].fitness);
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (population[i].fitness < ordered[j].fitness) 
        {
          ordered.splice(j, 0, population[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(population[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  getDescendingFitnessPopulation(population: individual[]): individual[] {
    //console.log("original")
    //console.log(population)
    let ordered: individual[] = [];
    ordered.push(population[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < population.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        //console.log("j" + ordered[j].fitness);
        ///if the fitness is more than some already inserted individual's fitness, insert it before
        if (population[i].fitness > ordered[j].fitness) 
        {
          ordered.splice(j, 0, population[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the minor value
      if (insertedIndividual === false) 
      {
        ordered.push(population[i]);
      }
    }
    /*console.log("getDescendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  /// deve inverter para fitnessMaior - fitness no caso de minimização'
  calcSumFits(population: individual[]): number 
  {
    let sumFits = 0;
    for (let ind of population) 
    {
      sumFits += ind.fitness;
    }
    //console.log("sumFits: " + sumFits);
    return sumFits;
  }

  calcPIs(population: individual[], fitSum: number): number[] {
    /*let pis:number[] = [];
    for(let ind of population){
      pis.push(ind.fitness/fitSum);
    }*/
    let pis = population.map(ind => {
      return ind.fitness / fitSum;
    });
    //console.log("calcSumPIs: " + pis);
    return pis;
  }

  calcCumulativeProb(probs: number[]): number[] {
    let cis: number[] = [];
    let ci = 0;
    for (let i = 0; i < probs.length; i++) 
    {
      ci += probs[i];
      cis.push(ci);
    }
    //console.log("calcCumulativeProb cis.length: " + cis.length);
    //console.log("calcCumulativeProb last ci: " + cis[cis.length-1]);
    return cis;
  }

  selectByRoulette(generation: individual[]): individual[] {
    let couples: individual[] = [];
    let sumFits: number = this.calcSumFits(generation);
    let pi = this.calcPIs(generation, sumFits);
    let ci = this.calcCumulativeProb(pi);
    while (couples.length < this.numOfNewIndividual()) 
    {
      let randomNumber = Math.random();
      let selectedIndex = 0;
      while (randomNumber > ci[selectedIndex]) 
      {
        selectedIndex++;
      }
      //console.log("selectByRoulette " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
      couples.push(generation[selectedIndex]);
    }

    return couples;
  }

  selectByTourney(generation: individual[]): individual[] 
  {
    let couples: individual[] = [];

    while (couples.length < this.numOfNewIndividual()) 
    {
      ///select individual by random
      let tourneyIndividuals = [];
      for (let index = 0; index < this.numOfIndividualsInTourney; index++) 
      {
        let randomIndex = Math.floor(Math.random() * this.populationSize);
        //if(teste < 0 && this.numCurrentGeneration < 2) console.log("selectByTourney randomIndex: " +randomIndex);
        tourneyIndividuals.push(generation[randomIndex]);
      }

      ///ordering
      tourneyIndividuals = this.getDescendingFitnessPopulation(tourneyIndividuals);

      ///select the best in the group
      couples.push(this.bestIndividualFromAscendingPop(tourneyIndividuals));
    }

    return couples;
  }

  bestIndividualFromAscendingPop(ascendingPopulation: individual[]) 
  {
    return ascendingPopulation[ascendingPopulation.length - 1];
  }

  bestIndividualsFromAscendingPop(ascendingPopulation: individual[], numOfIndividuals) 
  {
    return ascendingPopulation.slice(ascendingPopulation.length - numOfIndividuals, ascendingPopulation.length);
  }

  selectCouples(generation: individual[]) 
  {
    switch (this.couplesSelectionMode) 
    {
      case "Roleta":
        //console.log("selectCouples roleta");
        return this.selectByRoulette(generation);
        break;
      case "Torneio":
        //console.log("selectCouples torneio");
        return this.selectByTourney(generation);
        break;
      default:
        //console.log("selectCouples default");
        return null;
        break;
    }
  }

  applyCrossover(previousGeneration: individual[], nextGeneration: individual[]) 
  {
    //console.log("applyCrossover");
    let couples = this.selectCouples(previousGeneration);

    /// for every group of two individuals try to cross
    for (let index = 0; index < couples.length; index += 2) 
    {
      let couple: individual[] = couples.slice(index, index + 2);
      //console.log("couple");

      if (Math.random() < this.probCruzamento) 
      {
        ///cruza
        //console.log("can crossover");
        let newIndividuals: individual[] = this.crossIndividuals(couple);
        nextGeneration.push(newIndividuals[0]);
        nextGeneration.push(newIndividuals[1]);
        //console.log(nextGeneration);
      } 
      else 
      {
        ///keep with parents
        nextGeneration.push(couple[0]);
        nextGeneration.push(couple[1]);
      }
    }
  }

  crossIndividuals(couple: individual[]): individual[] {
    switch (this.crossoverMode) 
    {
      case 'Radcliff':
        //console.log("crossIndividuals 1 cut");
        return this.radcliffCrossover(couple);
        break;
      case 'Wright':
        //console.log("crossIndividuals 2 cuts");
        return this.wrightCrossover(couple);
        break;
      default:
        //console.log("selectCouples default");
        return null;
        break;
    }
  }

  radcliffCrossover(couple: individual[])
  {
    let newIndividuals: individual[] = [];
    let beta: number;
    let newChromosome: number[] = [];
    let newValue: number;
    for (let i = 0; i < this.numOfVariables; i++) {
      beta = Math.random();
      newChromosome.push( beta * couple[0].chromosome[i] + (1-beta) * couple[1].chromosome[i]);
    }
    newIndividuals.push( this.getIndividual(newChromosome) );
    
    newChromosome.length = 0;
    for (let i = 0; i < this.numOfVariables; i++) {
      beta = Math.random();
      newChromosome.push( (1-beta) * couple[1].chromosome[i] + beta * couple[0].chromosome[i]);
    }
    newIndividuals.push( this.getIndividual(newChromosome) );

    return newIndividuals;
  }

  ///////TODO
  wrightCrossover(couple: individual[])
  {
    let newIndividuals: individual[] = [];
    let newChromosome: number[] = [];
    let varValue: number;

    for (const wrightExp of this.wrightExpressions) {
      for (let i = 0; i < this.numOfVariables; i++) {
        varValue = wrightExp(couple[0].chromosome[i], couple[1].chromosome[i]);
        //console.log("varValue", varValue);
        if(this.isInsideInterval(i, varValue))
        {
          newChromosome.push(varValue);
        }
        else
        {
          newChromosome.push(this.getRandomArrayElement(couple).chromosome[i]);
        }
      }
      newIndividuals.push( this.getIndividual(newChromosome) );
      newChromosome.length = 0;
    }
    //console.log("wrightCrossover newIndividuals ", newIndividuals.concat());
    let selectedInd = this.getTheBestIndividuos(newIndividuals, 2);

    this.mountWrightHistogram(newIndividuals, selectedInd);

    //console.log("wrightCrossover selectedInd ", selectedInd.concat());
    return selectedInd;
  }

  isInsideInterval(varIndex, varValue)
  { 
    let varConfig = this.varConfigurations[varIndex];
    return (varValue  >= varConfig.intervalMin) && (varValue  <= varConfig.intervalMax);
  }

  getRandomArrayElement(array: any)
  {
    return array[this.getRamdomInt(array.length)];
  }

  mountWrightHistogram(originalArray: individual[], selectedInd: individual[])
  {
    // for (let i = 0; i < originalArray.length; i++) {
    //   if(selectedInd.includes(originalArray[i]))
    //   {
    //     this.wrightHistogram[i]++;
    //   }      
    // }
    for (const indiv of selectedInd) {
      let index = originalArray.indexOf(indiv);
      //console.log("mountWrightHistogram index", index);
      this.wrightChildrenHistogram[index]++;
      //this.wrightChildrenHistogram.splice(index, 1, this.wrightChildrenHistogram[index] + 1);
    }
  }

  getTheBestIndividuos(individuals: individual[], numberOfIndividuals): individual[]
  {
    let ordered =  this.getDescendingFitnessPopulation(individuals);
    return ordered.splice(individuals.length - numberOfIndividuals, individuals.length);
  }

  getAscendingArray(array: number[]): number[]
  {
    let ordered: number[]= [];
    ordered.push(array[0]);
    ///starting at 1, since we had already added 0th
    for (let i = 1; i < array.length; i++) 
    {
      let insertedIndividual = false;
      for (let j = 0; j < ordered.length; j++) 
      {
        ///if the fitness is less than some already inserted individual's fitness, insert it before
        if (array[i] < ordered[j]) 
        {
          ordered.splice(j, 0, array[i]);
          insertedIndividual = true;
          break;
        }
      }
      /// if it was not inserted, push it at the end, since it is the biggest value
      if (insertedIndividual === false) 
      {
        ordered.push(array[i]);
      }
    }
    /*console.log("getAscendingFitnessPopulation");
    console.log("first");
    console.log(ordered[0]);
    console.log("last");
    console.log(ordered[ordered.length - 1]);*/
    return ordered;
  }

  applyMutation(population: individual[]) 
  {
    let newChromosome;
    let mutationApplied = false;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
      let indiv = population[j];
      newChromosome = indiv.chromosome.concat();;
      switch (this.mutationMode) 
      {
        case "Gene":
          //console.log("applyMutation Gene");
          mutationApplied = this.tryMutationInGenes(newChromosome);
          break;
        case "Individuo":
          //console.log("applyMutation tryOneMutation");
          mutationApplied = this.tryOneMutation(newChromosome);
          break;
        default:
          //console.log("applyMutation default");
          return null;
          break;
      }

      if (mutationApplied) 
      {
        population.splice(j, 1, this.getIndividual(newChromosome));
      } 
    }
  }

  tryMutationInGenes(newChromosome: number[]): boolean
  {
    let mutationApplied = false;
    for (let varIndex = 0; varIndex < newChromosome.length; varIndex++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " chromosome " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.chromosome[k].concat());
          newChromosome[varIndex] = this.getRandomVarValue(varIndex);
          //console.log("after mutation" + indiv.chromosome[k].concat());
        }
      }
      return mutationApplied;
  }

  tryOneMutation(chromosome: number[]): boolean
  {
    if (Math.random() < this.probMutacao)
    {
      let mutationIndex = this.getRamdomInt(this.numOfVariables);
      chromosome[mutationIndex] = this.getRandomVarValue(mutationIndex);
      return true;
    }
    return false;
  }

  getRandomVarValue(varIndex: number)
  {
    let varConfig = this.varConfigurations[varIndex];
    return this.getRamdomReal(varConfig.intervalMax - varConfig.intervalMin) + varConfig.intervalMin;
  }

  getRamdomReal(maxExclusive: number)
  {
    return Math.random() * maxExclusive;
  }

  getRamdomInt(maxExclusive: number)
  {
    return Math.floor(Math.random() * maxExclusive);
  }

  selectIndividual(ci: number[]): number {
    //console.log(ci);
    let randomNumber = Math.random();
    let selectedIndex = 0;
    while (randomNumber > ci[selectedIndex]) 
    {
      selectedIndex++;
    }
    //console.log("selectIndividual " + "randomNumber[" + randomNumber + "]" + " selectedIndex[" + selectedIndex + "]"+ " ci[" + ci[selectedIndex] + "]");
    return selectedIndex;
  }

  getIntervalLabels(varConfig: VarConfiguration) 
  {
    //console.log("getIntervalLabels: ", varConfig);
    //console.log("granularity: ", ((varConfig.intervalMax - varConfig.intervalMin) / this.getDecimalMax()));
    let xValues: number[] = [];
    for (let i = 0; i < this.getDecimalMax(); i++)
    {
      xValues.push(this.wholeToReal(i, varConfig.intervalMin, varConfig.intervalMax));
    }
    varConfig.xRealValues = xValues;
    //return xValues;
  }

  getDecimalMax() /// be careful changing resolution
  {
    return Math.pow(2, this.graphResolution);
  }

  selectInitialPopulation(): individual[] {
    let currentGeneration: individual[] = [];
    for (let i = 0; i < this.populationSize; i++) 
    {
      //console.log("selectInitialPopulation: " + i);
      currentGeneration.push(
        ///note that we passe the bigChromossome size 2 * 10bits = 20bits 
        this.getIndividual(this.getRandomChromosome())
      );
    }
    return currentGeneration;
  }

  getIndividual(chromosome: number[]): individual {
    //console.log("getIndividual");
    let ind: individual = {  };
    ind.chromosome = chromosome.concat();
    ind.fxn = this.functionToAnalise(ind.chromosome);
    ind.fitness = this.calcFitness(ind.chromosome);

    ///getting the best individuals
    this.evaluateIndividual(ind);

    return ind;
  }

  splitArray(array:any [], numOfNewArrays: number): any []
  {
    // console.log("splitArray big array", array);
    // console.log("splitArray numOfNewArrays", numOfNewArrays);

    let arrays: any [] = [];
    let sizeNewArrays = array.length / numOfNewArrays;

    for (let index = 0; index < numOfNewArrays; index++) {
      arrays.push(array.slice((index * sizeNewArrays), ((index+1) * sizeNewArrays)));
    }
    return arrays;
  }

  evaluateIndividual(indiv: individual) 
  {
    let insertedInd;
    //let bestIndFull = this.bestInd.length == this.numOfBestToKeep;
    for (let i = 0; i < this.bestInd.length && i < this.numOfBestToKeep; i++) 
    {
      insertedInd = false;
      if (this.hasIndividual(indiv)) 
      {
        //console.log("Already in the best");
        insertedInd = true;
        return;
      } 
      else if (indiv.fitness < this.bestInd[i].fitness) 
      {
        insertedInd = true;
        //indiv.generation = this.numCurrentGeneration;
        if (this.bestInd.length == this.numOfBestToKeep)
          // if it is full, removes one to insert
          this.bestInd.splice(i, 1, indiv);
        else {
          this.bestInd.splice(i, 0, indiv);
        }
        break;
      }
    }
    if (!insertedInd && this.bestInd.length < this.numOfBestToKeep) 
    {
      /// if it was not inserted and there is space
      insertedInd = true;
      //indiv.generation = this.numCurrentGeneration;
      this.bestInd.push(indiv);
    }

    if (insertedInd) 
    {
      indiv.generation = this.numCurrentGeneration;
      //console.log("bestInd");
      //console.log(this.bestInd);
    }
  }

  hasIndividual(indiv: individual) 
  {
    let containsInd = false;
    /////// change if was more than 2 vars
    for (const oneOfTheBest of this.bestInd) {
      if(oneOfTheBest.chromosome[0] == indiv.chromosome[0] && /////x1 
         oneOfTheBest.chromosome[1] == indiv.chromosome[1] )  /////x2
         return true;
    }
    return containsInd;
  }

  getRandomChromosome() 
  {
    let chromosome = [];
    /// select 1 and 0 at random to get the binary number
    for (let i = 0; i < this.numOfVariables; i++)
      chromosome.push(this.getRandomVarValue(i));

    //console.log("getRandomChromosome: " + chromosome);

    return chromosome;
  }

  calcFitness(chromosome: number[]) 
  {
    ///trab 02 funcion
    /// fitness was set as -f+c, since -f grows when f is minimized
    //return - this.functionToAnalise(realNumber) + 400;
    //return - this.functionToAnalise(realNumber);

    ///trab 03 funcion
    //return this.functionToAnalise(realNumber) - this.minFunctionInTheInterval;
    
    ///considering 0 to 1
    /// and that minFunctionInTheInterval is a negative number
    //return (this.functionToAnalise(chromosome) - this.minFunctionInTheInterval) / (this.maxFunctionInTheInterval - this.minFunctionInTheInterval);
  
    return (  (this.functionToAnalise(chromosome) + this.calcPenalty(chromosome))   );
  }

  calcPenalty(chromosome: number[]): number
  {
    const x1: number = chromosome[0];
    const x2: number = chromosome[1];
    return this.constPenalty * (this.penalty1(x1, x2) + this.penalty2(x1, x2));
  }

  penalty1(x1: number, x2: number): number 
  {
    let maxV = Math.max(0, x1 + x2 - 0.5)
    return maxV*maxV;
  }

  penalty2(x1: number, x2: number): number 
  {
    let temp = x1 - x2 - 2;
    return temp*temp; 
  }

  functionToAnalise(chromosome: number[]): number
  {
    const x1: number = chromosome[0];
    const x2: number = chromosome[1];
    return this.functionToAnaliseNuns(x1, x2);
  }

  functionToAnaliseNuns(x1: number, x2: number): number 
  {

    ///trab 04 function
    ///21.5+x* sin(4 * Math.PI * x1) + x2 * Math.sin(20 * Math.PI * x2)
    ///21.5+x*sin(4 *pi*x)+y*sin(20*pi*y)
    ///https://academo.org/demos/3d-surface-plotter/?expression=21.5%2Bx*sin(4*pi*x)%2By*sin(20*pi*y)&xRange=-3.1%2C+12.1&yRange=4.1%2C+5.8&resolution=25
    ///=21.5+A2*SIN(4 *PI()*A2)+B2*SIN(20*PI()*B2)
    ///=21,5+A2*SIN(4 *PI()*A2)+B2*SIN(20*PI()*B2)
    /////return 21.5 + x1 * Math.sin(4 * Math.PI * x1) + x2 * Math.sin(20 * Math.PI * x2);


    ///trab 09
    return (x1-1)*(x1-1)+(x2-1)*(x2-1);
  }

  binArrayToDecimal(bits: number[])   
  {
    let decimalValue = 0;
    for (let i = 0; i < bits.length; i++)
      decimalValue += bits[i] * Math.pow(2, i);

    //console.log("binArrayToDecimal: " + decimalValue);
    return decimalValue;
  }

  wholeToReal(decimalWhole: number, intervalMin, intervalMax) 
  {
    /// number=1:1024
    let realNumber =
      (decimalWhole * (intervalMax - intervalMin)) / this.getDecimalMax() + intervalMin;

    //console.log("wholeToReal: real " + realNumber + " whole " + decimalWhole);
    return realNumber;
  }

  calcFitnessAverage(generation: individual[]): number {
    let averageFit: number = 0;
    generation.forEach(element => {
      averageFit += element.fitness;
    });
    averageFit /= generation.length;
    return averageFit;
  }

  /////////////////////
}

interface individual {
  ///the chromosome representing all the variables - now containing real numbers
  chromosome?: number[];
  
  fxn?: number;

  ///indicates how much the the individual is good (generally is f(x)+c)
  fitness?: number;

  ///generation number
  generation?: number;
}

interface VarConfiguration{
  name: string;
  intervalMin: number;
  intervalMax: number;
  xRealValues?: number[];
}