# Reactive Camel example with KAR Kafka using Cloud Events

In this example, Camel uses reactive streams to repeatedly request stock price updates from an external service, pack the price as a Cloud Event, send the event to a consumer using KAR's Kafka instance, unpack the cloud event on the consumer side and publish the price to the kar-output Slack channel.


## Steps to run the example

Install Cloud Events Java SDK (example uses version 2.0.0-SNAPSHOT):

```
git clone git@github.com:cloudevents/sdk-java.git@c632f56f8b3c6aed63b06e2c422ae3f4707506c5
cd sdk-java
mvn install
```

Create topics:
```
cd examples/camel-end-to-end
sh createTopics.sh
mvn compile
```

For the consumer to output to a Slack channel, expose the incoming webhook address via the `SLACK_KAR_OUTPUT_WEBHOOK` environment variable.

If the variable is not set the output will be emitted as a log message.

Run the consumer:
```
cd examples/camel-end-to-end
mvn compile exec:java -Pkafka-consumer
```

Run the producer:
```
cd examples/camel-end-to-end
mvn compile exec:java -Pkafka-producer
```