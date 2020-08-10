LEADWALLET CORE API :rocket:
===========================

This is the repository for the Lead Wallet implementation of the blockchain protocol.

| Technology | Use Case                |
|------------|-------------------------|
| Express    | Server/Routing          |
| Mongoose   | ODM/NoSQL Database      |
| Crypto-JS  | Hashing/Key Generation  |
| Morgan     | Request/Response Logging|


##### Dev/Git Note
Please follow instructions.

* Do not push directly to the **development** branch. Create a branch off the development branch and push every change to this branch. When raising a PR (Pull Request), ensure it is made against the development branch.

* Before pushing to your remote branch, ensure you merge any changes from the **development** branch with yours after you've committed your changes. This will ensure you have the latest change and we would in this way avoid merge conflicts.

* When raising a PR, please include a detailed note or leave comments explaining what the feature does. 

Example:
> **What feature does**
>
> Creates a peer-to-peer server to broadcast blocks available for mining to connected nodes.
>
> **Implementing classes/Added files**
>
> peer.ts 
>
> sockets.ts

##### Coding Conventions

* Prefer camel case when naming variables (e.g myVariable).
* Delegate complex functionalities (e.g hashing) to helper functions or utilities present in classes found in the utils folder.
* Class names should begin with uppercase as shown below

```ts
export class SomeClass {
 name: string;
 
 constructor(name: string) {
  this.name = name;
 }

 getName(): string {
  return this.name;
 }
}
```

##### Branch naming conventions

* Branches should be named this way: leadwallet-core-DEVELOPER_NAME (e.g leadwallet-core-kingsley)
