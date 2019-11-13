import { Component, OnInit } from "@angular/core";

declare var Plotly: any;


@Component({
  selector: "app-config-painel",
  templateUrl: "./config-painel.component.html",
  styleUrls: ["./config-painel.component.css"]
})
export class ConfigPainelComponent implements OnInit {
  startTime;
  spentTime;
  b: number;
  a: number;
  F: number;
  numDifferenceVectors: number;

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

  //fitnessConstant: number;

  constructor() {}

  ngOnInit() 
  {
    //console.log("ngOnInit");
    this.spentTime = 0;
    this.b = 100;
    this.a = 1;
    this.F = 0.5;
    this.numDifferenceVectors = 1;
    this.probCruzamento = 0.9;
    this.probMutacao = 0.30;
    this.numOfVariables = 2;
    this.graphResolution = 10;
    this.populationSize = 100;
    
    this.initConfigVars();

    this.maxNumOfGenerations = 200;
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
    this.numOfIndividualsInTourney = 4;
    
    this.wrightExpressions = [
      (valueP1: number, valueP2: number) => {return 0.5 * valueP1 + 0.5 * valueP2},
      (valueP1: number, valueP2: number) => {return 1.5 * valueP1 - 0.5 * valueP2},
      (valueP1: number, valueP2: number) => {return 0.5 * valueP1 + 1.5 * valueP2}
    ]

    //this.fitnessConstant = this.calcFitnessConstant();
  }

  /*calcFitnessConstant(): number
  {
    let c3 = 0;

    for (let i = 0; i < this.varConfigurations.length - 1; i++) {
      let max = this.varConfigurations[i+1].intervalMax;
      let min = this.varConfigurations[i].intervalMin;
      c3 += this.b * (max * max) + (this.a - min) * (this.a - min);
    }
    console.log("c3", c3);
    return c3;
  }*/

  initConfigVars()
  {
    this.varConfigurations = [];
    for (let i = 0; i < this.numOfVariables; i++) 
    {
      let xConfig: VarConfiguration = {
        name: 'x'+(i+1),
        // intervalMin:-2,
        // intervalMax: 2
        intervalMin: -5,
        intervalMax: 5
      }
      this.varConfigurations.push(xConfig);
    }
  }

  /*numOfNewIndividual() 
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
  }*/

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

    for (let ix1=0; ix1<this.varConfigurations[0].xRealValues.length; ix1+=50) 
    {
      let x1 = this.varConfigurations[0].xRealValues[ix1];
      for (let ix2=0; ix2<this.varConfigurations[1].xRealValues.length; ix2+=50)
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
    this.startTime = performance.now();

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

      //this.applyCrossover(currentGeneration, nextGeneration);
      nextGeneration = currentGeneration.concat();
      ///console here will show the final next population, since chrome update the objects in console
      this.applyDEMutation(nextGeneration);

      //console.log(nextGeneration);

      ///concating the best individuals that were kept
      nextGeneration = nextGeneration.concat(individualsToKeep);

      ///for keeping ordered lists
      nextGeneration = this.getDescendingFitnessPopulation(nextGeneration);

      this.generations.push(nextGeneration);
      currentGeneration = nextGeneration;
    }///while

    this.spentTime = performance.now() - this.startTime;

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
    //console.log(this.wrightChildrenHistogram);
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

  bestIndividualFromAscendingPop(ascendingPopulation: individual[]) 
  {
    return ascendingPopulation[ascendingPopulation.length - 1];
  }

  bestIndividualsFromAscendingPop(ascendingPopulation: individual[], numOfIndividuals) 
  {
    return ascendingPopulation.slice(ascendingPopulation.length - numOfIndividuals, ascendingPopulation.length);
  }

  isInsideInterval(varIndex, varValue)
  { 
    let varConfig = this.varConfigurations[varIndex];
    //console.log("isInsideInterval");
    //console.log("varConfig", varValue);
    //console.log("is ", (varValue  >= varConfig.intervalMin) && (varValue  <= varConfig.intervalMax));
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

  applyDEMutation(population: individual[]) 
  {
   //console.log("applyDEMutation population", population);
    let newVector;
    let u, v;
    //console.log("applyMutation");
    for (let j = 0; j < population.length; j++) 
    {
     //console.log("ind: " + j);
      let indiv = population[j];
      newVector = [];
      // the number of random vectors include one to sum and 2 * numOfDif to calculate differences
      let randVectors = this.getRandomVectors(population, 1 + 2 * this.numDifferenceVectors, [j]);
     //console.log("randVectors ", randVectors);
      for (let i = 0; i < this.numOfVariables; i++) {
        // for every variable
        // perturbando um vetor com diferenças
       //console.log("applyDEMutation i var " + i);
        
        v = randVectors[0][i];
       //console.log("applyDEMutation rand1 value " + v);
        for (let dif = 0; dif < this.numDifferenceVectors; dif++) {
          //console.log("applyDEMutation dif " + dif);
          //console.log("applyDEMutation dif value " + (this.F * (randVectors[1+dif][i] )) );
          v += this.F * (randVectors[1+dif][i] - randVectors[1+ dif + this.numDifferenceVectors][i] )         
        }

        if(!this.isInsideInterval(i, v))
        {
          //console.log("!isInsideInterval");
          //v = this.getRandomVarValue(i);
          v = indiv.vector[i];
        }

        // cruzamento
        let indexToCross = this.getRamdomInt(this.numOfVariables);
        if(Math.random() <= this.probCruzamento || i === indexToCross){
          u = v;
        }else{
          u = indiv.vector[i];
        }
        newVector.push(u);
      }
      
      let newIndividual = this.getIndividual(newVector);

      if (newIndividual.fitness < indiv.fitness) 
      {
        population.splice(j, 1, newIndividual);
      } 
    }
  }

  getRandomVectors(population: individual[], numOfVectors: number, indexesToExclude: number[] = []): number[]
  {
   //console.log("indexesToExclude", indexesToExclude);
    let randVectors = [];
    while(randVectors.length < numOfVectors)
    {
      let randomIndex;
      do{
        randomIndex = this.getRamdomInt(population.length);
      }while(indexesToExclude.includes(randomIndex))
      indexesToExclude.push(randomIndex);
      randVectors.push(population[randomIndex].vector);
    }
    return randVectors;
  }

  tryMutationInGenes(newVector: number[]): boolean
  {
    let mutationApplied = false;
    for (let varIndex = 0; varIndex < newVector.length; varIndex++) 
      {
        if (Math.random() < this.probMutacao) 
        {
          //console.log("mutation in individual " + j + " vector " + k);
          mutationApplied = true;
          //console.log("before mutation" + indiv.vector[k].concat());
          newVector[varIndex] = this.getRandomVarValue(varIndex);
          //console.log("after mutation" + indiv.vector[k].concat());
        }
      }
      return mutationApplied;
  }

  tryOneMutation(vector: number[]): boolean
  {
    if (Math.random() < this.probMutacao)
    {
      let mutationIndex = this.getRamdomInt(this.numOfVariables);
      vector[mutationIndex] = this.getRandomVarValue(mutationIndex);
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
        this.getIndividual(this.getRandomVector())
      );
    }
    return currentGeneration;
  }

  getIndividual(vector: number[]): individual {
    //console.log("getIndividual");
    let ind: individual = {  };
    ind.vector = vector.concat();
    ind.fxn = this.functionToAnalise(ind.vector);
    ind.fitness = this.calcFitness(ind.vector);

    ///getting the best individuals
    this.evaluateIndividual(ind);

    return ind;
  }

  splitArray(array:any [], numOfNewArrays: number): any []
  {
    //console.log("splitArray big array", array);
    //console.log("splitArray numOfNewArrays", numOfNewArrays);

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
      if(oneOfTheBest.vector[0] == indiv.vector[0] && /////x1 
         oneOfTheBest.vector[1] == indiv.vector[1] )  /////x2
         return true;
    }
    return containsInd;
  }

  getRandomVector() 
  {
    let vector = [];
    /// select 1 and 0 at random to get the binary number
    for (let i = 0; i < this.numOfVariables; i++)
      vector.push(this.getRandomVarValue(i));

    //console.log("getRandomVector: " + vector);

    return vector;
  }

  calcFitness(vector: number[]) 
  {
    ///considering 0 to 1
    /// and that minFunctionInTheInterval is a negative number
    //return (this.functionToAnalise(vector) - this.minFunctionInTheInterval) / (this.maxFunctionInTheInterval - this.minFunctionInTheInterval);
  
    return (  this.functionToAnalise(vector)   );
  }

  // functionToAnalise(vector: number[]): number 
  // {
  //   const x1: number = vector[0];
  //   const x2: number = vector[1];
  //   return this.functionToAnaliseNuns(x1, x2);
  // }

  functionToAnalise(vector: number[]): number
  {
    //console.log("functionToAnalise ")
    let fxn = 0;
    //console.log(" vector.length ", vector.length);
    for (let i = 0; i < vector.length - 1; i++) {
      let x1 = vector[i];
      let x2 = vector[i+1];
      fxn += this.b * (x2-x1*x1) * (x2-x1*x1) + (this.a-x1) * (this.a-x1);
    }
    return fxn;
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
    /////return 21.5 + x1 * Math.sin(4 * Math.PI * x1) + x2 * Math.sin(20 * Math.PI * x2);


    ///trab 08 function 01
    //return x1 * Math.sin(4 * x1) + 1.1 * Math.sin(2 * x2);

    ///trab 08 function 02
    //return 20 + x1 * x1 + x2 * x2 - 10 * Math.cos(2 * Math.PI * x1) - 10 * Math.cos(2 * Math.PI * x2);

    ///trab 10
    return this.b * (x2-x1*x1) * (x2-x1*x1) + (this.a-x1) * (this.a-x1);
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
  ///the array representing all the variables - now containing real numbers
  vector?: number[];
  
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