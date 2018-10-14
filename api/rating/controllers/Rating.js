"use strict";

/**
 * Rating.js controller
 *
 * @description: A set of functions called "actions" for managing `Rating`.
 */

module.exports = {
  /**
   * Retrieve rating records.
   *
   * @return {Object|Array}
   */

  find: async ctx => {
    if (ctx.query._q) {
      return strapi.services.rating.search(ctx.query);
    } else {
      return strapi.services.rating.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a rating record.
   *
   * @return {Object}
   */

  findOne: async ctx => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.rating.fetch(ctx.params);
  },

  params: async ctx => {
    return strapi.services.rating.getParams();
  },

  /**
   * Count rating records.
   *
   * @return {Number}
   */

  count: async ctx => {
    return strapi.services.rating.count(ctx.query);
  },

  /**
   * Create a/an rating record.
   *
   * @return {Object}
   */

  create: async ctx => {
    return strapi.services.rating.add(ctx.request.body);
  },

  /**
   * Update a/an rating record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.rating.edit(ctx.params, ctx.request.body);
  },

  /**
   * Destroy a/an rating record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.rating.remove(ctx.params);
  }
};
