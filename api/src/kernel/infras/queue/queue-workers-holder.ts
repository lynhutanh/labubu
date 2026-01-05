import { Worker } from "bullmq";

class QueueWorkersHolder {
  private list: Worker[] = [];

  public addToList(worker: Worker) {
    this.list.push(worker);
  }

  public getList() {
    return this.list;
  }

  public getByName(queueName: string) {
    return this.list.find((w) => w.name === queueName);
  }

  public async closeWorkers() {
    await Promise.all(
      this.list.map((worker) => worker.close && worker.close()),
    );
  }
}

export const QueueWorkerHolderSingleton = new QueueWorkersHolder();
