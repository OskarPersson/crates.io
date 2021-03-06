import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { percySnapshot } from 'ember-percy';

import setupMirage from '../helpers/setup-mirage';
import { visit } from '../helpers/visit-ignoring-abort';

module('Acceptance | Dashboard', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('redirects to / when not logged in', async function (assert) {
    await visit('/dashboard');
    assert.equal(currentURL(), '/');
    assert.dom('[data-test-flash-message]').hasText('Please log in to proceed');
  });

  test('shows the dashboard when logged in', async function (assert) {
    let user = this.server.create('user', {
      login: 'johnnydee',
      name: 'John Doe',
      email: 'john@doe.com',
      avatar: 'https://avatars2.githubusercontent.com/u/1234567?v=4',
    });

    this.authenticateAs(user);

    {
      let crate = this.server.create('crate', { name: 'rand' });
      this.server.create('version', { crate, num: '0.5.0' });
      this.server.create('version', { crate, num: '0.6.0' });
      this.server.create('version', { crate, num: '0.7.0' });
      this.server.create('version', { crate, num: '0.7.1' });
      this.server.create('version', { crate, num: '0.7.2' });
      this.server.create('version', { crate, num: '0.7.3' });
      this.server.create('version', { crate, num: '0.8.0' });
      this.server.create('version', { crate, num: '0.8.1' });
      this.server.create('version', { crate, num: '0.9.0' });
      this.server.create('version', { crate, num: '1.0.0' });
      this.server.create('version', { crate, num: '1.1.0' });
      user.followedCrates.add(crate);
    }

    {
      let crate = this.server.create('crate', { name: 'nanomsg' });
      this.server.create('crate-ownership', { crate, user });
      this.server.create('version', { crate, num: '0.1.0' });
      user.followedCrates.add(crate);
    }

    user.save();

    this.server.get(`/api/v1/users/${user.id}/stats`, { total_downloads: 3892 });

    await visit('/dashboard');
    assert.equal(currentURL(), '/dashboard');
    percySnapshot(assert);
  });
});
