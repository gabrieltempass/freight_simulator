//---------------------------------------------------
// (1) MAIN FUNCTION THAT CALCULATES THE FREIGHT COST
//---------------------------------------------------

function FREIGHT_COST(city_seller, state_seller, modality, length, width, height, real_weight, price, capital_customer, state_abbreviation_customer, contract)
{
  
//--------------------------------------------------
// (1.1) SECTION THAT DEALS WITH MISSING INFORMATION
//--------------------------------------------------
  
  if(city_seller === "" || state_seller === "" || modality === "" || length === "" || width === "" || height === "" || real_weight === "" || price === "" || (length + width + height) > 200)
  {
    var freight_cost = "";
    return freight_cost;
  }
  else
  {
    
    //PARAMETERS FOR DEBUGGING
    /*
    var app = SpreadsheetApp;
    var ss = app.getActiveSpreadsheet();
    var simulador_sheet = ss.getSheetByName("Simulador");
    var cidades_sheet = ss.getSheetByName("Cidades");
    
    var city_seller = simulador_sheet.getRange("C7").getValue();
    var state_seller = simulador_sheet.getRange("C8").getValue();
    var modality = simulador_sheet.getRange("D11").getValue();
    var length = simulador_sheet.getRange("D12").getValue();
    var width = simulador_sheet.getRange("D13").getValue();
    var height = simulador_sheet.getRange("D14").getValue();
    var real_weight = simulador_sheet.getRange("D15").getValue();
    var price = simulador_sheet.getRange("D16").getValue();
    var capital_customer = simulador_sheet.getRange("G12").getValue();
    var state_abbreviation_customer = simulador_sheet.getRange("F13").getValue();
    var contract = simulador_sheet.getRange("F11").getValue();
    */
    
//------------------------------------------------------------------------
// (1.2) SECTION THAT ASSIGNS VARIABLES TO THE AUXILIARY FUNCTIONS OUTPUTS
//------------------------------------------------------------------------
    
    city_seller = LOWERCASE(UNACCENT(city_seller));
    state_seller = LOWERCASE(UNACCENT(state_seller));
    var route_classification = ROUTE_CLASSIFICATION(city_seller, state_seller, capital_customer, state_abbreviation_customer, contract);
    var weight = WEIGHT(length, width, height, real_weight);
    
//---------------------------------------------------
// (1.3) SECTION THAT ASSIGNS VARIABLES TO THE SHEETS
//---------------------------------------------------
    
    var app = SpreadsheetApp;
    var ss = app.getActiveSpreadsheet();
    var simulador_sheet = ss.getSheetByName("Simulador");
    var cidades_sheet = ss.getSheetByName("Cidades");
    switch(true)
    {
      case contract === "olist contrato" && (modality === "SEDEX" || route_classification.charAt(0) === "L" || price > 3000):
        var modality_sheet = ss.getSheetByName("SEDEX - Contrato");
        var index_last_weight = 14;
        break;
      case contract === "olist contrato" && modality === "PAC":
        var modality_sheet = ss.getSheetByName("PAC - Contrato");
        var index_last_weight = 13;
        break;
      case contract === "correios balcão" && modality === "SEDEX":
        var modality_sheet = ss.getSheetByName("SEDEX - Balcão");
        var index_last_weight = 13;
        break;
      case contract === "correios balcão" && modality === "PAC":
        var modality_sheet = ss.getSheetByName("PAC - Balcão");
        var index_last_weight = 12;
    }
    
//------------------------------------------------------
// (1.4) SECTION THAT RETURNS THE COST FOR SEDEX AND PAC
//------------------------------------------------------
    
    var route_classification_list = modality_sheet.getRange(2, 2, 1, 20).getValues().shift();
    var index_route_classification = route_classification_list.indexOf(route_classification);
    if(weight <= 10000)
    {
      var weight_search = modality_sheet.getRange("A3").getValue();
      var i1 = 0;
      while(weight > weight_search.substring(weight_search.indexOf("a") + 2, weight_search.length))
      {
        weight_search = modality_sheet.getRange(4 + i1, 1).getValue();
        i1 ++;
      }
      var transportation_cost = modality_sheet.getRange(3 + i1, 2 + index_route_classification).getValue();
    }
    else
    {
      var transportation_cost = modality_sheet.getRange(index_last_weight, 2 + index_route_classification).getValue();
      if(weight % 1000 === 0)
      {
        transportation_cost = transportation_cost + ((weight / 1000) - 10) * modality_sheet.getRange(1 + index_last_weight, 2 + index_route_classification).getValue();
      }
      else
      {  
        transportation_cost = transportation_cost + (Math.floor(weight / 1000) - 9) * modality_sheet.getRange(1 + index_last_weight, 2 + index_route_classification).getValue();
      }
    }
    
//----------------------------------------------------------------------------------------------------------------
// (1.5) SECTION THAT CALCULATES THE INSURANCE COST, THE SPECIAL TREATMENT COST AND RETURNS THE FINAL FREIGHT COST
//----------------------------------------------------------------------------------------------------------------
    
    var insurance_cost = 0;
    if (price > 18.50)
    {
      insurance_cost = (price - 18.50) * 0.01
    }
    var special_treatment_cost = 0;
    if (length > 70 || width > 70 || height > 70)
    {
      special_treatment_cost = 79;
    }
    var freight_cost = transportation_cost + insurance_cost + special_treatment_cost;
    return freight_cost;
  }
}

//--------------------------------------------------------------
// (2) AUXILIARY FUNCTION THAT REMOVES THE ACCENTS FROM THE TEXT
//--------------------------------------------------------------

function UNACCENT(input)
{
  var accent_characters = "ŠŽšžŸÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïðñòóôõöùúûüýÿ";
  var regular_characters = "SZszYAAAAAACEEEEIIIIDNOOOOOUUUUYaaaaaaceeeeiiiidnooooouuuuyy";
  for(var i1 = 1; i1 <= input.length; i1 ++)
  {
    for(var i2 = 1; i2 <= accent_characters.length; i2 ++)
    {
      if(input.substring(i1- 1, i1) === accent_characters.substring(i2 - 1, i2))
      {
        switch(true)
        {
          case i1 === 1:
            input = regular_characters.substring(i2 - 1, i2) + input.substring(i1, input.length);
            break;
          case i1 > 1 && i1 < input.length:
            input = input.substring(0, i1 - 1) + regular_characters.substring(i2 - 1, i2) + input.substring(i1, input.length);
            break;
          case i1 === input.length:
            input = input.substring(0, i1 - 1) + regular_characters.substring(i2 - 1, i2);
        }
      }
    }
  }
  return input;
}

//-----------------------------------------------------
// (3) AUXILIARY FUNCTION THAT MAKES THE TEXT LOWERCASE
//-----------------------------------------------------

function LOWERCASE(input)
{
  var uppercase_characters = "ABCDEFGHIJKLMNOPQRSTUVXWYZÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖŠÙÚÛÜÝŸŽ";
  var lowercase_characters = "abcdefghijklmnopqrstuvxwyzàáâãäåçèéêëìíîïðñòóôõöšùúûüýÿž";
  for(var i1 = 1; i1 <= input.length; i1 ++)
  {
    for(var i2 = 1; i2 <= uppercase_characters.length; i2 ++)
    {
      if(input.substring(i1 - 1, i1) === uppercase_characters.substring(i2 - 1, i2))
      {
        switch(true)
        {
          case i1 === 1:
            input = lowercase_characters.substring(i2 - 1, i2) + input.substring(i1, input.length);
            break;
          case i1 > 1 && i1 < input.length:
            input = input.substring(0, i1 - 1) + lowercase_characters.substring(i2 - 1, i2) + input.substring(i1, input.length);
            break;
          case i1 === input.length:
            input = input.substring(0, i1 - 1) + lowercase_characters.substring(i2 - 1, i2);
        }
      }
    }
  }
  return input;
}

//-----------------------------------------------------------------------------
// (4) AUXILIARY FUNCTION THAT CALCULATES THE WEIGHT ACCORDING TO CORREIOS RULE
//-----------------------------------------------------------------------------

function WEIGHT(length, width, height, real_weight)
{
  var cubic_weight = length * width * height / 6;
  if(cubic_weight <= 5000)
  {
    var weight = real_weight;
  } 
  else if(cubic_weight <= real_weight)
  {
    var weight = real_weight;
  }
  else
  {
    var weight = cubic_weight;
  }
  return weight;
}

//----------------------------------------------------------------------------
// (5) AUXILIARY FUNCTION THAT CLASSIFIES THE ROUTE ACCORDING TO CORREIOS RULE
//----------------------------------------------------------------------------

function ROUTE_CLASSIFICATION(city_seller, state_seller, capital_customer, state_abbreviation_customer, contract)
{
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var classificacao_sheet = ss.getSheetByName("Classificação");
  var capitais_sheet = ss.getSheetByName("Capitais");
  
//----------------------------------------------------------------------------------------
// (5.1) SECTION THAT VERIFIES IF THE STATES FROM THE SELLER AND THE CUSTOMER ARE THE SAME
//----------------------------------------------------------------------------------------
  
  var states_list = ["acre", "alagoas", "amazonas", "amapa", "bahia", "ceara", "distrito federal", "espirito santo", "goias", "maranhao", "minas gerais", "mato grosso do sul", "mato grosso", "para", "paraiba", "pernambuco", "piaui", "parana", "rio de janeiro", "rio grande do norte", "rondonia", "roraima", "rio grande do sul", "santa catarina", "sergipe", "sao paulo", "tocantins"];
  var states_abbreviations_list = classificacao_sheet.getRange(2, 3, 1, 27).getValues().shift();
  var state_abbreviation_seller = states_abbreviations_list[states_list.indexOf(state_seller)];
  var same_state = false;
  if(state_abbreviation_seller === state_abbreviation_customer)
  {
    same_state = true;
  }
  
//---------------------------------------------------------------------------------------------------
// (5.2) SECTION THAT VERIFIES IF THE CITIES FROM THE SELLER AND THE CUSTOMER ARE CONSIDERED CAPITALS
//---------------------------------------------------------------------------------------------------
  
  var capital_seller = false;
  var comparison = city_seller + state_seller;
  var capital_cities_list = capitais_sheet.getRange(2, 3, 336).getValues();
  var capital_cities_states_list = capitais_sheet.getRange(2, 2, 336).getValues();
  var comparison_list = [];
  for(var i1 = 0; i1 < capital_cities_list.length; i1 ++)
  {
    comparison_list[i1] = capital_cities_list[i1] + capital_cities_states_list[i1];
  }
  for(var i2 = 0; i2 < capital_cities_list.length; i2 ++)
  {
    if (comparison === comparison_list[i2])
    {
      var capital_seller = true;
      break;
    }
  }
  if(capital_customer === "capital")
  {
    capital_customer = true;
  }
  else
  {
    capital_customer = false;
  }
  
//----------------------------------------------------------------
// (5.3) SECTION THAT CLASSIFIES THE ROUTE ACCORDING TO THE LETTER
//----------------------------------------------------------------
  
  switch(true)
  {
    case capital_seller === true && capital_customer === true && same_state === true:
      var classification_letter = "L";
      break;
    case capital_seller === true && capital_customer === true && same_state === false:
      var classification_letter = "N";
      break;
    case (capital_customer === false && same_state === true) || (capital_seller === false && capital_customer === true && same_state === true):
      var classification_letter = "E";
      break;
    case (capital_customer === false && same_state === false) || (capital_seller === false && capital_customer === true && same_state === false):
      var classification_letter = "I";
  }
  
//-----------------------------------------------------------------------------------------------------
// (5.4) SECTION THAT CLASSIFIES THE ROUTE ACCORDING TO THE NUMBER AND RETURNS THE FINAL CLASSIFICATION
//-----------------------------------------------------------------------------------------------------
  
  if(contract === "correios balcão" && (classification_letter === "L" || classification_letter === "E"))
  {
    var route_classification = classification_letter;
  }
  else
  {
    var index_origin = states_abbreviations_list.indexOf(state_abbreviation_seller);
    var index_destination = states_abbreviations_list.indexOf(state_abbreviation_customer);
    var classification_number = classificacao_sheet.getRange(3 + index_origin, 3 + index_destination).getValue();
    if(classification_number.length === 2)
    {
      classification_number = classification_number.substring(1, 2);
    }
    var route_classification = classification_letter + classification_number;
  }
  return route_classification;
}
