const fastify = require('fastify')({ logger: true })
const axios = require('axios')
const Color = require('color')

// HEXADECIMAL: #000000 (negro) a #FF0000 (blanco)
// RGB: red, green, blue (0-255), alpha (0 a 1) -> 0, 0, 0 = negro - 255, 255, 255 = blanco
// HSV (hue, saturation, value) - HSL (hue, saturation, light) - HSB - CMYK (cyan, magenta, yellow, black)

// HUE LIGHTS = HSB (hue, saturation, brightness)

// DECIMAL: 0-9
// BINARIO: 0-1
// HEXADECIMAL: 0-9 A-F

const COLORS = {
  BLUE: 'rgb(35, 32, 189)',
  GREEN: 'rgb(16, 230, 77)',
  HOT_PINK: 'rgb(255, 105, 180)',
  PURPLE: 'rgb(137, 16, 230)',
  TOMATO: 'rgb(255,99,71)',
  YELLOW: 'rgb(230, 230, 16)'
};

fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

const updateLight = (actionColor) => {
  const rgbColor = Color(actionColor);
  const [h, s, v] = rgbColor.hsv().color;
  axios({
      method: "put",
      url:
        "http://10.0.0.220/api/G-vbAfzffh30DzmkuLzpMc1YV74rWFCxIgpQcKeo/lights/7/state",
      data: {
        on: true,
        hue: parseInt((65535 * h) / 360, 10),
        sat: parseInt(254 * (s / 100), 10),
        bri: parseInt(254 * (v / 100), 10)
      },
    })
      .then((res) => console.log("res", res.status))
    .catch((err) => console.log(err));
  
  setTimeout(() => {
      axios({
      method: "put",
      url:
        "http://10.0.0.220/api/G-vbAfzffh30DzmkuLzpMc1YV74rWFCxIgpQcKeo/lights/7/state",
      data: {
        on: false
      },
    })
    }, 2000)
}

fastify.post('/stars', async (request, reply) => {
  const actionColor = request.body.action === 'created' ? COLORS.HOT_PINK : COLORS.BLUE;
  updateLight(actionColor);
})

fastify.post('/pr', async (request, reply) => {
  if (['opened', 'reopened'].includes(request.body.action)) {
    updateLight(COLORS.YELLOW);
  } else { // cerraron el PR
    updateLight(COLORS.PURPLE);
  }
})

fastify.post('/build', async (request, reply) => {
  console.log(request.body);
  if (request.body.state === 'pending') {
    updateLight(COLORS.YELLOW);
  } else if (request.body.state === 'failure') {
    updateLight(COLORS.TOMATO);
  } else {
    // noop
  }
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()