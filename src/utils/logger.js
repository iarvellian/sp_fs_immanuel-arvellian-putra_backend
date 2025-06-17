const { createLogger, transports, format } = require('winston');

const customTimestamp = format((info) => {
  const date = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const day = pad(date.getDate());
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  info.timestamp = `at ${hours}:${minutes} ${day} ${month} ${year}`;
  return info;
});

const logger = createLogger({
  format: format.combine(
    customTimestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ level, message, timestamp, stack }) => {
      return `${level}: ${message} ${timestamp}${stack ? '\n' + stack : ''}`;
    })
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      customTimestamp(),
      format.colorize(),
      format.printf(({ level, message, timestamp, stack }) => {
        return `${level}: ${message} ${timestamp}${stack ? '\n' + stack : ''}`;
      })
    )
  }));
}

module.exports = logger;