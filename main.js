const json = require('/var/rinha/source.rinha.json');
const memoize = require('./memoize');

function start() {
  const st = performance.now()
  try {
    compile(json.expression, {});
  } catch (error) {
    console.error('Failed to compile:\n' + error.message)
  } finally {
    const end = performance.now()
    console.info(`Compilation ended in ${Number(end - st).toFixed(2)} milliseconds`)
  }
}

function binaryExp(lhs, rhs, op) {
  switch(op) {
    case 'Add':
      return lhs + rhs
    case 'Mul':
      return lhs * rhs
    case 'Sub':
      return lhs - rhs
    case 'Div':
      return lhs / rhs
    case 'Rem':
      return lhs % rhs
    case 'Eq':
      return lhs == rhs
    case 'Neq':
      return lhs != rhs
    case 'Lt':
      return lhs < rhs
    case 'Gt':
      return lhs > rhs
    case 'Lte':
      return lhs <= rhs
    case 'Gte':
      return lhs >= rhs
    case 'And':
      return lhs && rhs
    case 'Or':
      return lhs || rhs
    default:
      throw new Error('Invalid operator: ' + op)
  }
}

function compile(input, scope) {
  if (!input) {
    throw new Error('Node not found: ' + input)
  } else if (!input.kind) {
    throw new Error('Node kind cannot be empty')
  }

  const kind = input.kind

  switch(kind) {
    case 'Print':
      const value = compile(input.value, scope)
      if (Array.isArray(value)) {
        console.log('(' + value.join(', ') +')')
        return value
      }
      console.log(value)
      return value
    case 'Str':
    case 'Int':
    case 'Bool':
      return input.value
    case 'Binary': {
      if (!input.lhs) {
        throw new Error('Lhs not found')
      }

      if (!input.rhs) {
        throw new Error('Rhs not found')
      }
      const lhs = compile(input.lhs, scope)
      const rhs = compile(input.rhs, scope)
      return binaryExp(lhs, rhs, input.op)
    }
    case 'Let':
      const v = compile(input.value, scope)
      scope[input.name.text] = v
      return compile(input.next, scope)
    case 'Var':
      if (input.text in scope) {
        return scope[input.text]
      }

      return console.error(`Variable ${input.text} not found`);
    case 'If':
      if (!input.condition) {
        throw new Error('Condition not found')
      }

      if (!input.then) {
        throw new Error('Then not found')
      }

      if (!input.otherwise) {
        throw new Error('Otherwise not found')
      }

      const cond = compile(input.condition, scope)
      if (cond) {
        return compile(input.then, scope)
      }

      return compile(input.otherwise, scope)
    case 'Tuple':
      const first = compile(input.first, scope)
      const second = compile(input.second, scope)
      return [first, second]
    case 'First':
      const tuple = compile(input.value, scope)
      return tuple[0]
    case 'Second':
      const tuplee = compile(input.value, scope)
      return tuplee[1]
    case 'Function':
      return { ...input, scope }
    case 'Call':
      const func = compile(input.callee, scope);
      const args = input.arguments.map(a => compile(a, scope))
      const nscope = { ...scope }
      func.parameters.forEach((param, index) => {
        nscope[param.text] = args[index];
      });

      if (args.length < func.parameters.length) {
        throw new Error('Missing parameters')
      }

      const res = memoize(compile, func, nscope, input.callee.text);
      return res
    case 'File':
      return compile(input.expression, scope);
    default:
      throw new Error('Unexpected Node kind: ' + kind)
  }
}



start();
