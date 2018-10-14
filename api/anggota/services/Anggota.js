"use strict";

/**
 * Anggota.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require("lodash");

module.exports = {
  /**
   * Promise to fetch all anggotas.
   *
   * @return {Promise}
   */

  fetchAll: params => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams("anggota", params);
    // Select field to populate.
    const populate = Anggota.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    return Anggota.find()
      .where(filters.where)
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  },

  /**
   * Promise to fetch a/an anggota.
   *
   * @return {Promise}
   */

  fetch: params => {
    // Select field to populate.
    const populate = Anggota.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    return Anggota.findOne(
      _.pick(params, _.keys(Anggota.schema.paths))
    ).populate(populate);
  },

  /**
   * Promise to fetch a/an anggota.
   *
   * @return {Promise}
   */

  averageReviews: async params => {
    // Select field to populate.
    const rating = await strapi.models.rating
      .findOne(
        { $query: {}, $orderby: { $_id: -1 } },
        { createdAt: 0, updatedAt: 0, _id: 0, anggota: 0, id: 0, __v: 0 }
      )
      .lean();
    const group = {
      _id: "$_id",
      count: { $sum: 1 }
    };

    const average = [];

    for (let key in rating) {
      group[key] = { $avg: "$ratings." + key };
      average.push(`$ratings.${key}`);
    }

    group.average = { $avg: { $avg: average } };

    const query = {};
    if (params.search) {
      query.nama = { $regex: new RegExp(params.search) };
    }
    const limit = Number(params._limit) || 10;
    const skip = Number(params._start) || 0;
    const sortQ = {};
    if (params.sort) {
      const sort = params.sort.split(":");
      sortQ[sort[0]] = Number(sort[1]);
    } else {
      sortQ.average = -1;
    }

    const find = await Anggota.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "rating",
          localField: "_id",
          foreignField: "anggota",
          as: "ratings"
        }
      },
      {
        $unwind: "$ratings"
      },
      {
        $group: group
      },
      {
        $lookup: {
          from: "anggota",
          localField: "_id",
          foreignField: "_id",
          as: "anggota"
        }
      },
      {
        $unwind: "$anggota"
      },
      {
        $addFields: {
          nama: "$anggota.nama",
          nrp: "$anggota.nrp",
          pangkat: "$anggota.pangkat",
          nomor_telpon: "$anggota.nomor_telpon"
        }
      },
      {
        $sort: sortQ
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    return find;
  },

  /**
   * Promise to count anggotas.
   *
   * @return {Promise}
   */

  count: params => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams("anggota", params);

    return Anggota.count().where(filters.where);
  },

  /**
   * Promise to add a/an anggota.
   *
   * @return {Promise}
   */

  add: async values => {
    // Extract values related to relational data.
    const relations = _.pick(
      values,
      Anggota.associations.map(ast => ast.alias)
    );
    const data = _.omit(values, Anggota.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Anggota.create(data);

    // Create relational data and return the entry.
    return Anggota.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an anggota.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Anggota.associations.map(a => a.alias));
    const data = _.omit(values, Anggota.associations.map(a => a.alias));

    // Update entry with no-relational data.
    const entry = await Anggota.update(params, data, { multi: true });

    // Update relational data and return the entry.
    return Anggota.updateRelations(
      Object.assign(params, { values: relations })
    );
  },

  /**
   * Promise to remove a/an anggota.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Select field to populate.
    const populate = Anggota.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    // Note: To get the full response of Mongo, use the `remove()` method
    // or add spent the parameter `{ passRawResult: true }` as second argument.
    const data = await Anggota.findOneAndRemove(params, {}).populate(populate);

    if (!data) {
      return data;
    }

    await Promise.all(
      Anggota.associations.map(async association => {
        const search =
          _.endsWith(association.nature, "One") ||
          association.nature === "oneToMany"
            ? { [association.via]: data._id }
            : { [association.via]: { $in: [data._id] } };
        const update =
          _.endsWith(association.nature, "One") ||
          association.nature === "oneToMany"
            ? { [association.via]: null }
            : { $pull: { [association.via]: data._id } };

        // Retrieve model.
        const model = association.plugin
          ? strapi.plugins[association.plugin].models[
              association.model || association.collection
            ]
          : strapi.models[association.model || association.collection];

        return model.update(search, update, { multi: true });
      })
    );

    return data;
  },

  /**
   * Promise to search a/an anggota.
   *
   * @return {Promise}
   */

  search: async params => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams("anggota", params);
    // Select field to populate.
    const populate = Anggota.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(" ");

    const $or = Object.keys(Anggota.attributes).reduce((acc, curr) => {
      switch (Anggota.attributes[curr].type) {
        case "integer":
        case "float":
        case "decimal":
          if (!_.isNaN(_.toNumber(params._q))) {
            return acc.concat({ [curr]: params._q });
          }

          return acc;
        case "string":
        case "text":
        case "password":
          return acc.concat({ [curr]: { $regex: params._q, $options: "i" } });
        case "boolean":
          if (params._q === "true" || params._q === "false") {
            return acc.concat({ [curr]: params._q === "true" });
          }

          return acc;
        default:
          return acc;
      }
    }, []);

    return Anggota.find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
