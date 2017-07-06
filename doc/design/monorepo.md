# Why is Babel a monorepo?

> The tool for managing the monorepo in Babel has been extracted out as [Lerna](https://github.com/lerna/lerna)

Juggling a multimodule project over multiple repos is like trying to teach a newborn baby how to
ride a bike.

Babel follows a monorepo approach, all officially maintained modules are in the same repo.

This is quite taboo but let's look at the pros and cons:

**Pros:**

 * Single lint, build, test and release process.
 * Easy to coordinate changes across modules.
 * Single place to report issues.
 * Easier to setup a development environment.
 * Tests across modules are ran together which finds bugs that touch multiple modules easier.

**Cons:**

 * Codebase looks more intimidating.
 * Repo is bigger in size.
 * ???

## This is dumb! Nobody in open source does this!

[React](https://github.com/facebook/react/tree/master/packages), [Meteor](https://github.com/meteor/meteor/tree/devel/packages), and [Ember](https://github.com/emberjs/ember.js/tree/master/packages), among others, do this.

## Previous discussion

- [Dan Luu](http://danluu.com/monorepo/)
- [Gregory](http://gregoryszorc.com/blog/2014/09/09/on-monolithic-repositories/)
- [Szorc](http://gregoryszorc.com/blog/2015/02/17/lost-productivity-due-to-non-unified-repositories/)
- [Face](https://www.youtube.com/watch?v=X0VH78ye4yY)[book](https://code.facebook.com/posts/218678814984400/scaling-mercurial-at-facebook/)
- [Benjamin Pollack](http://bitquabit.com/post/unorthodocs-abandon-your-dvcs-and-return-to-sanity/)
- [Benjamin Eberlei](https://qafoo.com/resources/presentations/froscon_2015/monorepos.html)
- [Simon Stewart](http://blog.rocketpoweredjetpants.com/2015/04/monorepo-one-source-code-repository-to.html)
- [Digital Ocean](https://www.digitalocean.com/company/blog/taming-your-go-dependencies/)
- [Google](http://www.infoq.com/presentations/Development-at-Google), [another](https://www.youtube.com/watch?v=W71BTkUbdqE)
- [Twitter](https://www.youtube.com/watch?v=bjh4DHuOf4E)
- [thedufer](http://www.reddit.com/r/programming/comments/1unehr/scaling_mercurial_at_facebook/cek9nkq)
- [Paul Hammant](http://paulhammant.com/categories.html#Trunk_Based_Development)
- [Exponent](https://blog.getexponent.com/universe-exponents-code-base-f12fa236b8e#.9dj8a82be)
