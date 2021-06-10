var App = (function() {
  return {
    init: init,
    filter: filter,
    sort: sort,
    order: order,
    openLightBox: openLightBox,
    closeLightBox: closeLightBox
  };

  var imgObj, sortBy, orderBy, curIndex;

  function sort(ele, name) {
    var selectedNav = document.querySelector(
      ".img-sort-navigation-nav.selected"
    );
    if (selectedNav) {
      selectedNav.classList.remove("selected");
    }
    ele.classList.add("selected");

    sortBy = (orderBy == "DESC" ? "-" : "") + name;
    imgObj.data = imgObj.data.sort(dynamicSort(sortBy));

    render();
  }

  function order(ele, val) {
    var selectedNav = document.querySelector(
      ".img-order-navigation-nav.selected"
    );
    if (selectedNav) {
      selectedNav.classList.remove("selected");
    }
    ele.classList.add("selected");
    orderBy = val;

    imgObj.data = imgObj.data.reverse();

    render();
  }

  function render() {
    var wrapper = document.getElementById("img-section__row"),
      node;
    for (var key in imgObj) {
      imgObj[key].forEach(function(item) {
        node = document.getElementById("img-section-item-row-" + item.id);
        node.remove();

        wrapper.appendChild(node);
      });
    }
  }

  function dynamicSort(property) {
    var sortOrder = 1;

    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }

    return function(a, b) {
      if (sortOrder == -1) {
        return b[property].toString().localeCompare(a[property].toString());
      } else {
        return a[property].toString().localeCompare(b[property].toString());
      }
    };
  }

  function init() {
    var checkRow = document.querySelectorAll(".img-section__item");
    if (checkRow.length == 0) {
      createImageNode();
    }

    //LightBox
    initLightBox();
  }

  function filter(ele, name, value) {
    var selectedNav = document.querySelector(
        ".img-filter-navigation-nav.selected"
      ),
      node;
    if (selectedNav) {
      selectedNav.classList.remove("selected");
    }
    ele.classList.add("selected");

    for (var key in imgObj) {
      imgObj[key].forEach(function(item) {
        node = document.getElementById("img-section-item-row-" + item.id);
        switch (name) {
          case "category":
            item.category == value
              ? node.classList.add("active")
              : node.classList.remove("active");
            break;
          case "date":
            item.year == value
              ? node.classList.add("active")
              : node.classList.remove("active");
            break;
          case "location":
            convertToSlug(item.location) == value
              ? node.classList.add("active")
              : node.classList.remove("active");
            break;
          default:
            node.classList.add("active"); //Show All
        }
      });
    }
  }

  function createFilterNav() {
    var wrapper = document.getElementById("img-filter"),
      locSlug;

    //Add Category Filter
    var navCategory = document.createElement("ul");
    navCategory.className = "img-filter-navigation";
    wrapper.appendChild(navCategory);

    //Add Date Filter
    var navDate = document.createElement("ul");
    navDate.className = "img-filter-navigation";
    wrapper.appendChild(navDate);

    //Add Location Filter
    var navLocation = document.createElement("ul");
    navLocation.className = "img-filter-navigation";
    wrapper.appendChild(navLocation);

    for (var key in imgObj) {
      imgObj[key].forEach(function(item) {
        //Category Filter
        if (!document.getElementById("img-filter-category-" + item.category)) {
          var li = document.createElement("li");
          li.innerText = capitalizeFirstLetter(item.category);
          li.className = "img-filter-navigation-nav";
          li.id = "img-filter-category-" + item.category;
          li.setAttribute(
            "onclick",
            "App.filter(this, 'category','" + item.category + "')"
          );
          navCategory.appendChild(li);
        }

        //Date Filter
        if (!document.getElementById("img-filter-date-" + item.year)) {
          var li = document.createElement("li");
          li.innerText = item.year;
          li.className = "img-filter-navigation-nav";
          li.id = "img-filter-date-" + item.year;
          li.setAttribute(
            "onclick",
            "App.filter(this, 'date','" + item.year + "')"
          );
          navDate.appendChild(li);
        }

        //Location Filter
        locSlug = convertToSlug(item.location); //string to slug convert
        if (!document.getElementById("img-filter-location-" + locSlug)) {
          var li = document.createElement("li");
          li.innerText = item.location;
          li.className = "img-filter-navigation-nav";
          li.id = "img-filter-location-" + locSlug;
          li.setAttribute(
            "onclick",
            "App.filter(this, 'location','" + locSlug + "')"
          );
          navLocation.appendChild(li);
        }
      });
    }
  }

  function createImageNode() {
    getJsonObject(function(obj) {
      imgObj = obj;

      //default category obj Set
      sortBy = "category";
      orderBy = "ASC";
      imgObj.data = imgObj.data.sort(dynamicSort(sortBy));

      for (var key in imgObj) {
        imgObj[key].forEach(function(item) {
          var sectionItem = document.createElement("div"),
            wrapper = document.getElementById("img-section__row");
          sectionItem.className = "img-section__item active";
          sectionItem.id = "img-section-item-row-" + item.id;

          sectionItem.innerHTML =
            '<img src="' +
            item.img.src +
            '" data-lightbox-img="' +
            item.img.zoom +
            '" class="img-section__item--image" alt="' +
            item.img.alt +
            '"/><div class="img-section__img-info" onClick="App.openLightBox(' +
            item.id +
            ');"><span class="img-section__img-category">' +
            capitalizeFirstLetter(item.category) +
            '</span><span class="img-section__img-date">' +
            new Date(item.time).toLocaleDateString() +
            '</span><span class="img-section__img-author"><i>By</i> <span class="img-section__img-author-name">' +
            item.author +
            '</span></span><span class="img-section__img-place">' +
            item.location +
            "</span></div>";
          wrapper.appendChild(sectionItem);
        });
      }

      createFilterNav();
    });
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function convertToSlug(string) {
    return string
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }

  function getJsonObject(cb) {
    // read text from URL location
    var request = new XMLHttpRequest();
    request.open("GET", "data/app.json", true);
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.send(null);
    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status === 200) {
        var type = request.getResponseHeader("Content-Type");

        try {
          cb(JSON.parse(request.responseText));
        } catch (err) {
          cb(err);
        }
      }
    };
  }

  function initLightBox() {
    var lightbox = document.getElementById("lightbox");

    //Prev Navigation
    lightbox.querySelector(".prev").addEventListener(
      "click",
      function(e) {
        navigateLightBox("prev");
      },
      false
    );

    //next Navigation
    lightbox.querySelector(".next").addEventListener(
      "click",
      function(e) {
        navigateLightBox("next");
      },
      false
    );

    // Keyboard Navigation
    document.body.addEventListener(
      "keydown",
      function(e) {
        var code = e.keyCode,
          evt = new Event("click");

        //ESC
        if (code == 27) {
          closeLightBox();
        }
        //left
        if (code == 37) {
          document.querySelector(".prev").dispatchEvent(evt);
        }
        //right
        if (code == 39) {
          document.querySelector(".next").dispatchEvent(evt);
        }
      },
      false
    );
  }

  function openLightBox(indexID) {
    var lightbox = document.getElementById("lightbox"),
      imgEle = document
        .getElementById("img-section-item-row-" + indexID)
        .querySelector(".img-section__item--image"),
      lightboxContentImg = document.querySelector(
        ".lightbox__content .img-section__item--image"
      );

    lightbox.classList.add("active");

    lightboxContentImg.setAttribute(
      "src",
      imgEle.getAttribute("data-lightbox-img")
    );

    //Close LightBox if clicked anywhere else
    lightboxContentImg.parentElement.parentElement.parentElement.addEventListener(
      "click",
      function(e) {
        if (e.target == document.getElementById("lightbox")) {
          closeLightBox();
        }
      }
    );

    imgObj.data.forEach(function(item, index) {
      if (item.id == indexID) {
        curIndex = index;
      }
    });
  }

  // Prev Next Navigation
  function navigateLightBox(direction) {
    var nextIndex;
    if (direction == "next") {
      nextIndex = curIndex < imgObj.data.length ? +curIndex + 1 : 0;
    } else {
      nextIndex = curIndex > 0 ? +curIndex - 1 : imgObj.data.length - 1;
    }

    curIndex = nextIndex;

    var imgEle = document
        .getElementById("img-section-item-row-" + imgObj.data[curIndex].id)
        .querySelector(".img-section__item--image"),
      lightboxContentImg = document.querySelector(
        ".lightbox__content .img-section__item--image"
      );

    lightboxContentImg.setAttribute(
      "src",
      imgEle.getAttribute("data-lightbox-img")
    );
  }

  function closeLightBox() {
    document.getElementById("lightbox").classList.remove("active");
  }
})();

App.init();
