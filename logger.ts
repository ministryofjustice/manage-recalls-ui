import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: process.env.NODE_ENV !== 'production' })

const logger = bunyan.createLogger({
  name: 'Manage Recalls',
  stream: formatOut,
  level: process.env.NODE_ENV === 'test' ? 'fatal' : 'debug',
})

export default logger
