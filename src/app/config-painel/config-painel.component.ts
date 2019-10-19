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
  resolution: number;
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
  checkBoxSelectedItens: string[];
  numOfIndividualsInTourney: number;
  numOfElitismInd: number;
  numOfCuts: number;

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

  constructor() {}

  ngOnInit() 
  {
    console.log("ngOnInit");

    this.probCruzamento = 0.6;
    this.probMutacao = 0.01;
    this.numOfVariables = 2;
    this.resolution = 10;
    console.log("totalResolution: ", this.totalResolution);
    this.populationSize = 50;
    this.numOfCuts = 1;
    
    let x1Config: VarConfiguration = {
      name: 'x1',
      intervalMin: -3.1,
      intervalMax: 12.1
    }

    let x2Config: VarConfiguration = {
      name: 'x2',
      intervalMin: 4.1,
      intervalMax: 5.8
    }
    ///update numOfVariables
    this.varConfigurations = [x1Config, x2Config];

    this.maxNumOfGenerations = 70;
    this.bestInd = [];
    this.numOfBestToKeep = 5;
    this.numCurrentGeneration = 0;
    this.generations = [];
    this.isGraphResponsive = true;
    this.showGraph1 = 'block';
    this.showGraph2 = 'none';
    //this.initGensDataset();
    this.drawFunction();
    this.couplesSelectionMode = "Roleta";
    this.checkBoxSelectedItens = ["elitism"];
    this.numOfIndividualsInTourney = 4;
    this.numOfElitismInd = 2;
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

    for (let ix1=0; ix1<this.varConfigurations[0].xRealValues.length; ix1+=25) 
    {
      let x1 = this.varConfigurations[0].xRealValues[ix1];
      for (let ix2=0; ix2<this.varConfigurations[1].xRealValues.length; ix2+=25)
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
    this.drawFunction();

    this.generations = [];

    /// melhores indivíduos para a tabela
    this.bestInd = [];

    /// número da geração atual
    this.numCurrentGeneration = 0;

    let initialPopulation = this.selectInitialPopulation();

    ///getting a list starting with the worst individual
    let currentGeneration = this.getAscendingFitnessPopulation(initialPopulation);

    this.generations.push(currentGeneration);

    /// operations that we do for every generation
    while (this.generations.length <= this.maxNumOfGenerations) 
    {
      this.numCurrentGeneration++;

      ///this is not need since we are ordering in the end of the "for"
      //currentGeneration = this.getAscendingFitnessPopulation(currentGeneration);

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
      nextGeneration = this.getAscendingFitnessPopulation(nextGeneration);

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
      tourneyIndividuals = this.getAscendingFitnessPopulation(tourneyIndividuals);

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
        console.log("selectCouples torneio");
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
    switch (this.numOfCuts) 
    {
      case 1:
        //console.log("crossIndividuals 1 cut");
        return this.crossSingleCut(couple);
        break;
      case 2:
        //console.log("crossIndividuals 2 cuts");
        return this.crossDoubleCut(couple);
        break;
      default:
        //console.log("selectCouples default");
        return null;
        break;
    }
  }

  crossSingleCut(couple: individual[]): individual[] {
    //console.log("crossIndividuals couple: ");
    //couple.forEach((indiv)=>console.log(indiv.chromosome));
    let newIndividuals: individual[] = [];
    let newChromosome: number[] = [];

    ///Math.floor(Math.random()*(this.resolution - 1)) 0 to 8 - +=1 1 to 9
    let indexToCross: number =
      Math.floor(Math.random() * (this.totalResolution - 1)) + 1; /// 1 to 9 (pos entre os bits)
    //console.log("crossIndividuals indexToCross: " + indexToCross);

    newChromosome = couple[0].chromosome
      .slice(0, indexToCross)
      .concat(couple[1].chromosome.slice(indexToCross, this.totalResolution));
    let ind1: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind1);
    //console.log("crossIndividuals ind1: " + ind1.chromosome);

    newChromosome = couple[1].chromosome
      .slice(0, indexToCross)
      .concat(couple[0].chromosome.slice(indexToCross, this.totalResolution));
    let ind2: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind2);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
  }

  crossDoubleCut(couple: individual[]): individual[] {
    //console.log("crossIndividuals couple: ");
    //couple.forEach((indiv)=>console.log(indiv.chromosome));
    let newIndividuals: individual[] = [];
    let newChromosome: number[] = [];
    let indexesToCut: number[] = this.getBalancedIndexesToCut(); 
    ///Math.floor(Math.random()*(this.resolution - 1)) 0 to 8 - +=1 1 to 9

    newChromosome = 
              couple[0].chromosome.slice(0, indexesToCut[0])
      .concat(couple[1].chromosome.slice(indexesToCut[0], indexesToCut[1]))
      .concat(couple[0].chromosome.slice(indexesToCut[1], this.totalResolution));
    let ind1: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind1);
    //console.log("crossIndividuals ind1: " + ind1.chromosome);

    newChromosome = 
              couple[1].chromosome.slice(0, indexesToCut[0])
      .concat(couple[0].chromosome.slice(indexesToCut[0], indexesToCut[1]))
      .concat(couple[1].chromosome.slice(indexesToCut[1], this.totalResolution));
    let ind2: individual = this.getIndividual(newChromosome);
    newIndividuals.push(ind2);
    //console.log("crossIndividuals ind2: " + ind2.chromosome);

    return newIndividuals;
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

  getIndexesToCut(): number[]
  {
    let indexesToCut: number[] = []; 
    let indexToCut: number;
    while(indexesToCut.length < this.numOfCuts)
    {
      indexToCut =
          Math.floor(Math.random() * (this.totalResolution - 1)) + 1; /// 1 to 19 (pos entre os bits)

      if( !indexesToCut.includes(indexToCut))
      {
        //console.log("Contains: " + indexToCut);
        indexesToCut.push(indexToCut);
      }
      
    }
    indexesToCut = this.getAscendingArray(indexesToCut)
    //console.log("indexes: ", indexesToCut);
    
    return indexesToCut;
  }

  ///return one number between 1 and 9 and another between 11 and 19, for being sure of cutting both x1 and x2
  getBalancedIndexesToCut(): number[]
  {
    let indexesToCut: number[] = []; 
    let indexToCut: number;
    while(indexesToCut.length < this.numOfCuts)
    {
      indexToCut =
          Math.floor(Math.random() * (this.resolution - 1)) + 1; /// 1 to 9 (pos entre os bits)

      if( !indexesToCut.includes(indexToCut))
      {
        //console.log("Contains: " + indexToCut);
        indexesToCut.push(indexToCut);
      }
    }
    indexesToCut[1] += 10;
    //console.log("indexes: ", indexesToCut);

    return indexesToCut;
  }

  get totalResolution(): number
  {
    return this.resolution * this.numOfVariables;
  }

  applyMutation(population: individual[]) 
  {
    let mutationApplied = false;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
      let indiv = population[j];
      mutationApplied = false;
      for (let k = 0; k < indiv.chromosome.length; k++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " chromosome " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.chromosome[k]);
          if (indiv.chromosome[k] === 1) indiv.chromosome[k] = 0;
          //if(indiv.chromosome[k] === 0)
          else indiv.chromosome[k] = 1;
          //console.log("after mutation" + indiv.chromosome[k]);
        }
      }
      if (mutationApplied) 
      {
        population.splice(j, 1, this.getIndividual(indiv.chromosome));
      }
    }
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

  selectInitialPopulation(): individual[] {
    let currentGeneration: individual[] = [];
    for (let i = 0; i < this.populationSize; i++) 
    {
      //console.log("selectInitialPopulation: " + i);
      currentGeneration.push(
        ///note that we passe the bigChromossome size 2 * 10bits = 20bits 
        this.getIndividual(this.getRandomChromosome(this.totalResolution))
      );
    }

    /*
    let bits = [1,1,1,1,1,1,1,1,1,1]
    this.binArrayToDecimal(bits);
    this.wholeToReal( this.binArrayToDecimal(bits));

    for(let i = 0; i < this.populationSize; i++)
    {
      this.wholeToReal( this.binArrayToDecimal(currentGeneration[i]));
    }
    */
    return currentGeneration;
  }

  getIndividual(bigChromosome: number[]): individual {
    //console.log("getIndividual");
    let ind: individual = {  };
    ind.chromosome = bigChromosome;
    ind.variables = [];
    let chromosomes = this.splitArray(bigChromosome, this.varConfigurations.length);
    for(const varIndex in this.varConfigurations)
    {
      let variable: Variable = this.getVariable(chromosomes[varIndex], this.varConfigurations[varIndex]);
      ind.variables.push(variable)
    }
    
    ind.fitness = this.calcFitness(ind.variables);

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
      else if (indiv.fitness > this.bestInd[i].fitness) 
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
    for (const oneOfTheBest of this.bestInd) {
      if(oneOfTheBest.variables[0].realNumber == indiv.variables[0].realNumber && /////x1 
         oneOfTheBest.variables[1].realNumber == indiv.variables[1].realNumber )  /////x2
         return true;
    }
    return containsInd;
  }

  getRandomChromosome(resolution: number) 
  {
    let chromosome = [];
    /// select 1 and 0 at random to get the binary number
    for (let i = 0; i < resolution; i++)
      chromosome.push(Math.round(Math.random()));

    //console.log("getRandomChromosome: " + chromosome);

    return chromosome;
  }

  calcFitness(variables: Variable[]) 
  {
    ///trab 02 funcion
    /// fitness was set as -f+c, since -f grows when f is minimized
    //return - this.functionToAnalise(realNumber) + 400;
    //return - this.functionToAnalise(realNumber);

    ///trab 03 funcion
    //return this.functionToAnalise(realNumber) - this.minFunctionInTheInterval;
    
    ///considering 0 to 1
    /// and that minFunctionInTheInterval is a negative number
    return (this.functionToAnalise(variables) - this.minFunctionInTheInterval) / (this.maxFunctionInTheInterval - this.minFunctionInTheInterval);
  }

  functionToAnalise(variables: Variable[]): number 
  {
    const x1: number = variables[0].realNumber;
    const x2: number = variables[1].realNumber;
    return this.functionToAnaliseNuns(x1, x2);
  }

  functionToAnaliseNuns(x1: number, x2: number): number 
  {
    
    ///trab 02 function
    //return - Math.abs(x * Math.sin(Math.sqrt(Math.abs(x)) ));

    ///trab 03 function
    ///to graph calculator - x * sin(x^4) + cos(x^2)
    //return x * Math.sin(Math.pow(x, 4)) + Math.cos(Math.pow(x, 2));

    ///trab 04 function
    ///21.5+x* sin(4 * Math.PI * x1) + x2 * Math.sin(20 * Math.PI * x2)
    ///21.5+x*sin(4 *pi*x)+y*sin(20*pi*y)
    ///https://academo.org/demos/3d-surface-plotter/?expression=21.5%2Bx*sin(4*pi*x)%2By*sin(20*pi*y)&xRange=-3.1%2C+12.1&yRange=4.1%2C+5.8&resolution=25
    ///=21.5+A2*SIN(4 *PI()*A2)+B2*SIN(20*PI()*B2)
    ///=21,5+A2*SIN(4 *PI()*A2)+B2*SIN(20*PI()*B2)
    return 21.5 + x1 * Math.sin(4 * Math.PI * x1) + x2 * Math.sin(20 * Math.PI * x2);


    ///trab 08 function
    
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

  getDecimalMax() /// be careful changing resolution
  {
    return Math.pow(2, this.resolution);
  }

  calcFitnessAverage(generation: individual[]): number {
    let averageFit: number = 0;
    generation.forEach(element => {
      averageFit += element.fitness;
    });
    averageFit /= generation.length;
    return averageFit;
  }

  getVariable(chromosome: number[], varConfig: VarConfiguration): Variable
  {
    let variable: Variable = { chromosome };
    variable.realNumber = this.wholeToReal(this.binArrayToDecimal(variable.chromosome) + 1, varConfig.intervalMin, varConfig.intervalMax); 
    return variable;
  }

  /////////////////////
}



interface Variable {
  chromosome: number[];
  ///x real value
  realNumber?: number;
}

interface individual {
  ///the chromosome representing all the variables
  chromosome?: number[];

  ///vector containing the x1 and x2 values (real and binary formats)
  variables?: Variable[];
  
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