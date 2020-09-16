This example uses KAR's Actor Programming Model to implement
Dijkstra's solution to the Dining Philosophers problem
(https://en.wikipedia.org/wiki/Dining_philosophers_problem).

The Philosophers and their Forks are all actors and interact via actor
method invocations to implement the distributed protocol that ensures
no Philosopher starves.

Philosophers use actor reminders (time triggered callbacks) to trigger
their actions.

Fault tolerance is provided by checkpointing actor state and the
at-least-once invocation semantics provided by KAR.

A Cafe may contain an arbitrary number of tables of Philosophers. Each
Cafe tracks its occupancy and generates messages when it seats new
tables or when a sated Philosopher leaves.

To run the example locally, first do an `npm install`.
Then in one window start up the server code:
```shell
kar run -app dpjs -actors Cafe,Fork,Philosopher node philosophers.js
```
In a second window, use the `kar` cli to invite some Philosopers to diner:
```shell
kar invoke -app dpjs Cafe "Cafe de Flore" serveDinner
```
You can control the number of Philosophers or their target number of
meals via optional arguments to `serveDinner`
```shell
# Invite 10 Philosophers to a feast of 20 meals each
kar invoke -app dpjs Cafe "Cafe de Flore" serveDinner 10 20
```