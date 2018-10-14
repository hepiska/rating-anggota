'use strict';

/**
 * Anggota.js controller
 *
 * @description: A set of functions called "actions" for managing `Anggota`.
 */

module.exports = {

  /**
   * Retrieve anggota records.
   *
   * @return {Object|Array}
   */

  find: async (ctx) => {
    if (ctx.query._q) {
      return strapi.services.anggota.search(ctx.query);
    } else {
      return strapi.services.anggota.fetchAll(ctx.query);
    }
  },

  /**
   * Retrieve a anggota record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.anggota.fetch(ctx.params);
  },

  /**
   * Count anggota records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.anggota.count(ctx.query);
  },

   /**
   * Count anggota with total review.
   *
   * @return {object}
   */
  averageReview: async (ctx) => {
        return strapi.services.anggota.averageReviews(ctx.query)
  },

  /**
   * Create a/an anggota record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.anggota.add(ctx.request.body);
  },

  /**
   * Update a/an anggota record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.anggota.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an anggota record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.anggota.remove(ctx.params);
  }
};
