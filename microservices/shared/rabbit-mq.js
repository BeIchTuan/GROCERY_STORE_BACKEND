const amqplib = require("amqplib");

/**
 * Class để quản lý kết nối và tương tác với RabbitMQ
 */
class RabbitMQClient {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connect();
  }

  /**
   * Kết nối đến RabbitMQ server
   */
  async connect() {
    try {
      // Lấy thông tin kết nối từ biến môi trường
      const host = process.env.RABBITMQ_HOST || "localhost";
      const port = process.env.RABBITMQ_PORT || "5672";
      const user = process.env.RABBITMQ_USER || "guest";
      const password = process.env.RABBITMQ_PASSWORD || "guest";
      const vhost = process.env.RABBITMQ_VHOST || "/";

      // Tạo URL kết nối
      const url = `amqp://${user}:${password}@${host}:${port}${vhost}`;

      // Kết nối đến RabbitMQ server
      this.connection = await amqplib.connect(url);

      // Tạo channel
      this.channel = await this.connection.createChannel();

      console.log("Kết nối thành công đến RabbitMQ");

      // Xử lý sự kiện đóng kết nối
      this.connection.on("close", () => {
        console.log("Kết nối RabbitMQ đã đóng, đang kết nối lại...");
        setTimeout(() => this.connect(), 5000);
      });
    } catch (error) {
      console.error("Lỗi kết nối RabbitMQ:", error.message);
      // Thử kết nối lại sau 5 giây
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Tạo exchange
   * @param {string} exchangeName - Tên exchange
   * @param {string} type - Loại exchange (direct, fanout, topic, headers)
   */
  async createExchange(exchangeName, type = "direct") {
    if (!this.channel) {
      throw new Error("Chưa kết nối RabbitMQ");
    }

    await this.channel.assertExchange(exchangeName, type, { durable: true });
  }

  /**
   * Tạo queue
   * @param {string} queueName - Tên queue
   */
  async createQueue(queueName) {
    if (!this.channel) {
      throw new Error("Chưa kết nối RabbitMQ");
    }

    await this.channel.assertQueue(queueName, { durable: true });
  }

  /**
   * Liên kết queue với exchange
   * @param {string} queueName - Tên queue
   * @param {string} exchangeName - Tên exchange
   * @param {string} routingKey - Khóa định tuyến
   */
  async bindQueue(queueName, exchangeName, routingKey) {
    if (!this.channel) {
      throw new Error("Chưa kết nối RabbitMQ");
    }

    await this.channel.bindQueue(queueName, exchangeName, routingKey);
  }

  /**
   * Gửi thông điệp
   * @param {string} exchangeName - Tên exchange
   * @param {string} routingKey - Khóa định tuyến
   * @param {Object} message - Thông điệp cần gửi
   */
  async sendMessage(exchangeName, routingKey, message) {
    if (!this.channel) {
      throw new Error("Chưa kết nối RabbitMQ");
    }

    this.channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  /**
   * Nhận thông điệp
   * @param {string} queueName - Tên queue
   * @param {Function} callback - Hàm xử lý thông điệp
   */
  async consumeMessages(queueName, callback) {
    if (!this.channel) {
      throw new Error("Chưa kết nối RabbitMQ");
    }

    await this.channel.consume(queueName, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content, msg);
        this.channel.ack(msg);
      }
    });
  }

  /**
   * Đóng kết nối
   */
  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

module.exports = new RabbitMQClient();
