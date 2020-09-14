function parameterToNoFlo(param) {
  let datatype;
  switch (param.type) {
    case 'string': {
      datatype = 'string';
      break;
    }
    case 'number': {
      datatype = 'number';
      break;
    }
    case 'integer': {
      datatype = 'int';
      break;
    }
    case 'boolean': {
      datatype = 'boolean';
      break;
    }
    case 'object': {
      datatype = 'object';
      break;
    }
    case 'array': {
      datatype = 'array';
      break;
    }
    default: {
      datatype = 'all';
    }
  }
  const nofloDef = {
    datatype,
    description: param.description,
  };
  if (param.enum) {
    nofloDef.values = param.enum;
  }

  // Special cases
  if (param.type === 'string' && param.format === 'date-time') {
    nofloDef.datatype = 'date';
  }
  return nofloDef;
}

exports.parameterToNoFlo = parameterToNoFlo;
